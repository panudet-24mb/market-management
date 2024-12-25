from fastapi import FastAPI, HTTPException, Depends
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from typing import List
from fastapi.staticfiles import StaticFiles
from database import SessionLocal, engine
from models import Base , Tenant, Lock, Contract, Document, Bill, Zone ,LockHasContract ,BindContractRequest , Meter , MeterUsage ,LockReserve ,LockReserveAttachment
from crud import (
    create_tenant, get_tenants, get_tenant_by_id,
    create_lock, get_locks,
    create_contract, get_contracts_by_tenant,
    create_bill
)
from crud import (
    create_zone, get_zones, get_zone_by_id, update_zone, delete_zone
)
# import CORS
from fastapi.middleware.cors import CORSMiddleware
import os 
from datetime import datetime
#timedelta
from datetime import timedelta
from datetime import date
from sqlalchemy import Integer, func, or_
from repository.meter import (
    create_meter,
    get_meters,
    get_meter_by_id,
    create_meter_usage,
    get_meter_usages,
    validate_meter_usage ,
    get_latest_meter_usages
    )
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from sqlalchemy import Integer, func, and_
from sqlalchemy import extract
from line import send_line_flex_message
import shutil
import uuid
from pathlib import Path
from fastapi import Body
UPLOAD_DIR = "./uploads"

#static files
#read file 





Base.metadata.create_all(bind=engine)

app = FastAPI()
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Tenant Endpoints
@app.post("/api/tenants")
def create_tenant_api(tenant_data: dict, db: Session = Depends(get_db)):
    return create_tenant(db, tenant_data)

@app.get("/api/tenants")
def get_tenants_api(db: Session = Depends(get_db)):
    return get_tenants(db)

@app.get("/api/tenants/{tenant_id}")
def get_tenant_api(tenant_id: int, db: Session = Depends(get_db)):
    tenant = get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant

# Lock Endpoints
@app.post("/api/locks")
def create_lock_api(lock_data: dict, db: Session = Depends(get_db)):
    return create_lock(db, lock_data)

@app.get("/api/locks")
def get_locks_api(db: Session = Depends(get_db)):
    return get_locks(db)

# Contract Endpoints
@app.post("/api/contracts")
def create_contract_api(
    tenant_id: int = Form(...),
    lock_id: int = Form(...),
    start_date: str = Form(...),
    end_date: str = Form(...),
    contract_number: str = Form(None),
    files: List[UploadFile] = File([]),
    rent_rate: float = Form(...),
    water_rate: float = Form(...),
    electric_rate: float = Form(...),
    advance: float = Form(...),
    deposit: float = Form(...),
    note: str = Form(...),
    contract_name: str = Form(...),
    db: Session = Depends(get_db),

):
    # Validate inputs
    if not tenant_id or not start_date or not end_date:
        raise HTTPException(status_code=400, detail="Missing required fields.")

    # Generate a default contract number if not provided
    if not contract_number:
        today = datetime.now()
        contract_number = f"QD-{today.strftime('%Y%m%d')}-{today.strftime('%H%M%S')}"

    # Create the contract record
    new_contract = Contract(
        tenant_id=tenant_id,
        lock_id=lock_id,
        start_date=start_date,
        end_date=end_date,
        contract_number=contract_number,
        status="Active",
        rent_rate=rent_rate,
        water_rate=water_rate,
        electric_rate=electric_rate,
        advance=advance,
        deposit=deposit,
        note=note,
        contract_name= contract_name
    )
    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)

    # Handle file uploads
    uploaded_files = []
    for file in files:
        tenant_folder = os.path.join(UPLOAD_DIR, str(tenant_id), contract_number)
        os.makedirs(tenant_folder, exist_ok=True)

        file_path = os.path.join(tenant_folder, file.filename)
        with open(file_path, "wb") as f:
            f.write(file.file.read())

        # Save file metadata in the database
        document = Document(
            contract_id=new_contract.id,
            contract_type="general",  # Modify as needed
            filename=file.filename,
            path=file_path,
        )
        db.add(document)
        uploaded_files.append(document)

    db.commit()

    # Attach uploaded documents to the contract response
    response_data = new_contract.__dict__
    response_data["documents"] = [doc.__dict__ for doc in uploaded_files]

    return response_data
# @app.get("/api/contracts/tenant/{tenant_id}")
# def get_contracts_by_tenant_api(tenant_id: int, db: Session = Depends(get_db)):
#     return get_contracts_by_tenant(db, tenant_id)

@app.post("/api/contracts/{contract_id}/documents")
async def add_documents_to_contract(
    contract_id: int,
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    # Validate contract exists
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    # Define the directory path for storing files
    contract_number = contract.contract_number
    
    dir_path = f"uploads/{contract_number}"
    os.makedirs(dir_path, exist_ok=True)  # Create the directory if it does not exist

    # Save files and create document entries
    documents = []
    for file in files:
        file_path = os.path.join(dir_path, file.filename)
        try:
            with open(file_path, "wb") as f:
                f.write(file.file.read())
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

        document = Document(
            contract_id=contract_id,
            filename=file.filename,
            path=file_path,
            contract_type="general"
        )
        db.add(document)
        documents.append(document)

    db.commit()

    return {"message": "Documents added successfully", "documents": documents}

@app.get("/api/contracts/tenant/{tenant_id}")
def get_contracts_by_tenant(tenant_id: int, db: Session = Depends(get_db)):
    # Load contracts and join with locks
    contracts = (
        db.query(Contract)
        .options(joinedload(Contract.documents))  # Eagerly load documents for contracts
        .join(Lock, Lock.id == Contract.lock_id)  # Join with locks
        .filter(Contract.tenant_id == tenant_id)
        .all()
    )

    if not contracts:
        return []

    # Construct the response with documents and lock name included
    result = []
    for contract in contracts:
        result.append({
            "id": contract.id,
            "lock_id": contract.lock_id,
            "name": contract.lock.lock_name,  # Include lock_name
            "tenant_id": contract.tenant_id,
            "contract_number": contract.contract_number,
            "start_date": contract.start_date,
            "end_date": contract.end_date,
            "status": contract.status,
            "rent_rate": contract.rent_rate,
            "water_rate": contract.water_rate,
            "electric_rate": contract.electric_rate,
            "advance": contract.advance,
            "deposit": contract.deposit,
            "documents": [
                {
                    "id": doc.id,
                    "contract_type": doc.contract_type,
                    "filename": doc.filename,
                    "path": doc.path,
                }
                for doc in contract.documents
            ]
        })

    return result
# Bill Endpoints
@app.post("/api/bills")
def create_bill_api(bill_data: dict, db: Session = Depends(get_db)):
    return create_bill(db, bill_data)




# Zone Endpoints
@app.post("/api/zones")
def create_zone_api(zone_data: dict, db: Session = Depends(get_db)):
    return create_zone(db, zone_data)

@app.get("/api/zones")
def get_zones_api(db: Session = Depends(get_db)):
    return get_zones(db)

@app.get("/api/zones/{zone_id}")
def get_zone_api(zone_id: int, db: Session = Depends(get_db)):
    zone = get_zone_by_id(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone

@app.put("/api/zones/{zone_id}")
def update_zone_api(zone_id: int, zone_data: dict, db: Session = Depends(get_db)):
    updated_zone = update_zone(db, zone_id, zone_data)
    if not updated_zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return updated_zone

@app.delete("/api/zones/{zone_id}")
def delete_zone_api(zone_id: int, db: Session = Depends(get_db)):
    deleted_zone = delete_zone(db, zone_id)
    if not deleted_zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return {"message": "Zone deleted successfully"}

@app.get('/api/contracts/tenant/{tenant_id}', )
def get_contracts_by_tenant_id(tenant_id: int, db: Session = Depends(get_db)):
    contracts = db.query(Contract).filter(Contract.tenant_id == tenant_id).all()
    result = []
    for contract in contracts:
        documents = db.query(Document).filter(Document.contract_id == contract.id).all()
        contract_data = contract.__dict__
        contract_data['documents'] = [doc.__dict__ for doc in documents]
        result.append(contract_data)
    return result



# @app.get("/api/locks-with-contracts", response_model=List[dict])
# def get_locks_with_contracts(db: Session = Depends(get_db)):
#     # Subquery to select the latest active contract or NULL for each lock
#     subquery = (
#         db.query(
#             LockHasContract.lock_id,
#             Contract.id.label("contract_id"),
#             Contract.contract_name,
#             Contract.contract_number,
#             Contract.start_date,
#             Contract.end_date,
#             Tenant.first_name.label("tenant_first_name"),
#             Tenant.last_name.label("tenant_last_name"),
#             Tenant.profile_image,

#         )
#         .join(Contract, LockHasContract.contract_id == Contract.id, isouter=True)
#         .join(Tenant, Contract.tenant_id == Tenant.id, isouter=True)
#         .filter(
#             and_(
#                 LockHasContract.deleted_at.is_(None),  # Exclude deleted contracts
#                 LockHasContract.status == "active"    # Only include active contracts
#             )
#         )
#         .subquery()
#     )

#     # Main query to fetch locks and associated contract data
#     query = (
#         db.query(
#             Lock.id.label("lock_id"),
#             Lock.lock_name,
#             Lock.lock_number,
#             Lock.zone_id,
#             Lock.size,
#             Lock.active,
#             subquery.c.contract_id,
#             subquery.c.contract_number,
#             subquery.c.contract_name,
#             subquery.c.start_date,
#             subquery.c.end_date,
#             subquery.c.tenant_first_name,
#             subquery.c.tenant_last_name,
#             subquery.c.profile_image,
#         )
#         .outerjoin(subquery, Lock.id == subquery.c.lock_id)  # Join locks with subquery
#         .order_by(Lock.id.desc())
#     ).all()

#     # Format the result to include contract expiry calculation
#     result = []
#     for lock in query:
#         days_left = (
#             (lock.end_date - datetime.utcnow().date()).days
#             if lock.end_date
#             else None
#         )
#         result.append({
#             "lock_id": lock.lock_id,
#             "lock_name": lock.lock_name,
#             "lock_number": lock.lock_number,
#             "zone_id": lock.zone_id,
#             "size": lock.size,
#             "active": lock.active,
#             "contract_status": "active" if lock.contract_id else None,
#             "tenant_name": f"{lock.tenant_first_name} {lock.tenant_last_name}" if lock.tenant_first_name else None,
#             "days_left": days_left,
#             "is_near_expiry": days_left is not None and days_left <= 30,
#             "start_date": lock.start_date,
#             "end_date": lock.end_date,
#             "contract_number": lock.contract_number,
#             "profile_image": lock.profile_image,
#             "contract_id": lock.contract_id,
#             "contract_name": lock.contract_name
         
#         })

#     return result


from sqlalchemy.orm import joinedload

@app.get("/api/locks-with-contracts", response_model=List[dict])
def get_locks_with_contracts(db: Session = Depends(get_db)):
    # Subquery to select the latest active contract or NULL for each lock
    subquery = (
        db.query(
            LockHasContract.lock_id,
            Contract.id.label("contract_id"),
            Contract.contract_name,
            Contract.contract_number,
            Contract.start_date,
            Contract.end_date,
            Tenant.first_name.label("tenant_first_name"),
            Tenant.last_name.label("tenant_last_name"),
            Tenant.profile_image,
        )
        .join(Contract, LockHasContract.contract_id == Contract.id, isouter=True)
        .join(Tenant, Contract.tenant_id == Tenant.id, isouter=True)
        .filter(
            and_(
                LockHasContract.deleted_at.is_(None),  # Exclude deleted contracts
                LockHasContract.status == "active"    # Only include active contracts
            )
        )
        .subquery()
    )

    # Main query to fetch locks, associated contract data, and lock reserves
    query = (
        db.query(
            Lock.id.label("lock_id"),
            Lock.lock_name,
            Lock.lock_number,
            Lock.zone_id,
            Lock.size,
            Lock.active,
            subquery.c.contract_id,
            subquery.c.contract_number,
            subquery.c.contract_name,
            subquery.c.start_date,
            subquery.c.end_date,
            subquery.c.tenant_first_name,
            subquery.c.tenant_last_name,
            subquery.c.profile_image,
            LockReserve.id.label("reserve_id"),
            LockReserve.status.label("reserve_status"),
            LockReserve.contract_name.label("reserve_contract_name"),
            LockReserve.contract_number.label("reserve_contract_number"),
            LockReserve.deposit.label("reserve_deposit"),
            LockReserve.advance.label("reserve_advance"),
            LockReserve.created_at.label("reserve_created_at"),
            LockReserve.contract_note.label("reserve_contract_note"),
        )
        .outerjoin(subquery, Lock.id == subquery.c.lock_id)  # Join locks with subquery
        .outerjoin(LockReserve, and_(Lock.id == LockReserve.lock_id, LockReserve.deleted_at.is_(None)))  # Join locks with LockReserve
        .order_by(Lock.id.desc())
    ).all()

    # Format the result
    result = {}
    for lock in query:
        lock_id = lock.lock_id
        if lock_id not in result:
            result[lock_id] = {
                "lock_id": lock.lock_id,
                "lock_name": lock.lock_name,
                "lock_number": lock.lock_number,
                "zone_id": lock.zone_id,
                "size": lock.size,
                "active": lock.active,
                "contract_status": "active" if lock.contract_id else None,
                "tenant_name": f"{lock.tenant_first_name} {lock.tenant_last_name}" if lock.tenant_first_name else None,
                "days_left": (
                    (lock.end_date - datetime.utcnow().date()).days
                    if lock.end_date
                    else None
                ),
                "is_near_expiry": lock.end_date is not None and (lock.end_date - datetime.utcnow().date()).days <= 30,
                "start_date": lock.start_date,
                "end_date": lock.end_date,
                "contract_number": lock.contract_number,
                "profile_image": lock.profile_image,
                "contract_id": lock.contract_id,
                "contract_name": lock.contract_name,
                "lock_reserves": []
            }
        if lock.reserve_id:
            result[lock_id]["lock_reserves"].append({
                "reserve_id": lock.reserve_id,
                "status": lock.reserve_status,
                "contract_name": lock.reserve_contract_name,
                "contract_number": lock.reserve_contract_number,
                "deposit": lock.reserve_deposit,
                "advance": lock.reserve_advance,
                "created_at": lock.reserve_created_at,
                "contract_note": lock.reserve_contract_note,
            })

    return list(result.values())



@app.get("/api/contracts/non_expired")
def get_non_expired_contracts(db: Session = Depends(get_db)):
    today = date.today()
    contracts = db.query(Contract).filter(Contract.end_date >= today).all()
    if not contracts:
        raise HTTPException(status_code=404, detail="No active contracts found.")
    return contracts




@app.post("/api/lock_has_contracts")
def bind_contract(request: BindContractRequest, db: Session = Depends(get_db)):
    # Check if there is an existing active contract for the lock
    existing_lock_contract = (
        db.query(LockHasContract)
        .filter(
            LockHasContract.lock_id == request.lock_id,
            LockHasContract.deleted_at.is_(None),  # Ensure it's not deleted
            LockHasContract.status == 'active'    # Ensure it's active
        )
        .join(Contract, LockHasContract.contract_id == Contract.id)
        .filter(Contract.end_date >= datetime.utcnow().date())  # Contract not expired
        .first()
    )

    if existing_lock_contract:
        raise HTTPException(
            status_code=400,
            detail="An active contract already exists for this lock."
        )

    # Check if there is an expired contract for the lock and update its status
    expired_lock_contract = (
        db.query(LockHasContract)
        .filter(
            LockHasContract.lock_id == request.lock_id,
            LockHasContract.deleted_at.is_(None),
            LockHasContract.status == 'active'
        )
        .join(Contract, LockHasContract.contract_id == Contract.id)
        .filter(Contract.end_date < datetime.utcnow().date())  # Contract expired
        .first()
    )

    if expired_lock_contract:
        # Mark the expired contract as 'expired'
        expired_lock_contract.status = 'expired'
        expired_lock_contract.updated_at = datetime.utcnow()
        db.commit()

    # Bind the new contract to the lock
    new_entry = LockHasContract(
        lock_id=request.lock_id,
        contract_id=request.contract_id,
        status=request.status
    )
    db.add(new_entry)
    db.commit()

    return {"message": "Contract successfully bound to lock."}

@app.post("/api/contracts/{contract_id}/cancel")
def cancel_contract(contract_id: int, db: Session = Depends(get_db)):
    # Find the active LockHasContract entry for the provided contract
    lock_contract = db.query(LockHasContract).filter(
        LockHasContract.contract_id == contract_id,
        LockHasContract.status == "active",
        LockHasContract.deleted_at.is_(None)  # Ensure it is not already cancelled
    ).first()

    if not lock_contract:
        raise HTTPException(
            status_code=404,
            detail="No active contract found for the specified lock."
        )

    # Update the status and mark as cancelled
    lock_contract.status = "cancelled"
    lock_contract.deleted_at = datetime.utcnow()
    db.commit()

    return {"message": "Contract successfully cancelled."}

@app.post("/api/meters")
def create_meter_api(meter_data: dict, db: Session = Depends(get_db)):
    return create_meter(db, meter_data)

@app.get("/api/meters")
def get_meters_api(db: Session = Depends(get_db)):
    return get_meters(db)

@app.get("/api/meters/{meter_id}")
def get_meter_api(meter_id: int, db: Session = Depends(get_db)):
    meter = get_meter_by_id(db, meter_id)
    if not meter:
        raise HTTPException(status_code=404, detail="Meter not found")
    return meter

# # Meter Usages Endpoints
# @app.post("/api/meter_usages")
# def create_meter_usage_api(meter_id: int, meter_start: int, meter_end: int, note: str = None, db: Session = Depends(get_db)):
#     if meter_end < meter_start:
#         raise HTTPException(status_code=400, detail="End reading cannot be less than start reading")

#     month = datetime.utcnow().month
#     year = datetime.utcnow().year

#     if not validate_meter_usage(db, meter_id, month, year):
#         raise HTTPException(status_code=400, detail="Meter usage for this month already exists")

#     usage_data = {
#         "meter_id": meter_id,
#         "meter_start": meter_start,
#         "meter_end": meter_end,
#         "meter_usage": meter_end - meter_start,
#         "note": note,
#     }
#     return create_meter_usage(db, usage_data)


# # Meter Usages Endpoints

@app.post("/api/meter_usage")
async def create_meter_usage_api(
    asset_tag: str,
    meter_end: int,
    img_path: str = None,
    db: Session = Depends(get_db)
):
    try:
        # Fetch the meter ID based on the asset_tag
        meter = db.query(Meter).filter(Meter.asset_tag == asset_tag).first()
        if not meter:
            raise HTTPException(status_code=404, detail="Meter with given asset tag not found")

        # Get the current month and year
        current_month = datetime.now().month
        current_year = datetime.now().year

        # Check if a record already exists for this meter in the current month
        existing_usage = (
            db.query(MeterUsage)
            .filter(
                MeterUsage.meter_id == meter.id,
                MeterUsage.deleted_at == None,
                extract('month', MeterUsage.created_at) == current_month,
                extract('year', MeterUsage.created_at) == current_year
            )
            .first()
        )

        if existing_usage:
            return {"message": "Meter usage for this month already exists", "usage_id": existing_usage.id}

        # Get the latest meter usage for this meter
        last_usage = (
            db.query(MeterUsage)
            .filter(MeterUsage.meter_id == meter.id, MeterUsage.deleted_at == None)
            .order_by(MeterUsage.created_at.desc())
            .first()
        )

        # Calculate meter_start from the last month's meter_end
        meter_start = last_usage.meter_end if last_usage else 0

        # Ensure the new meter_end is greater than or equal to meter_start
        if meter_end < meter_start:
            raise HTTPException(status_code=400, detail="End reading cannot be less than start reading")

        # Calculate the meter usage for this month
        meter_usage = meter_end - meter_start

        # Create and save the new meter usage record
        new_usage = MeterUsage(
            meter_id=meter.id,
            meter_start=meter_start,
            meter_end=meter_end,
            meter_usage=meter_usage,
            img_path=img_path,
            status="UNCONFIRMED",
            date_check=datetime.now().strftime("%Y-%m-%d"),
        )
        db.add(new_usage)
        db.commit()
        db.refresh(new_usage)

        return {"message": "Meter usage added successfully", "usage_id": new_usage.id}

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload_bill")
async def upload_bill(file: UploadFile = File(...)):
    try:
        # Create directory based on the current year-month
        current_date = datetime.now()
        year_month = current_date.strftime("%Y-%m")
        upload_path = Path(UPLOAD_DIR) / year_month
        upload_path.mkdir(parents=True, exist_ok=True)

        # Save the file
        file_path = upload_path / file.filename
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Return the relative file path
        return {"filename": str(file_path.relative_to(UPLOAD_DIR))}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    
    
@app.get("/api/meter_usages/{meter_id}")
def get_meter_usages_api(meter_id: int, db: Session = Depends(get_db)):
    
    usage = db.query(MeterUsage).filter(
        MeterUsage.meter_id == meter_id,
        MeterUsage.deleted_at.is_(None)
    ).order_by(MeterUsage.created_at.desc()).first()
    if not usage:
        raise HTTPException(status_code=404, detail="No usage found for this meter")



    return usage  # FastAPI will handle serialization to the Pydantic model

# @app.get("/api/meter_usages/{meter_id}/{month}")
# def get_meter_usage_by_month(meter_id: int, month: str, db: Session = Depends(get_db)):
#     """
#     Fetch meter usage for a specific meter and month.
#     If no data exists for the month, prepare data for input.
#     """
#     year, month = map(int, month.split("-"))
#     usage = db.query(MeterUsage).filter(
#         MeterUsage.meter_id == meter_id,
#         MeterUsage.deleted_at.is_(None),
#         extract('year', MeterUsage.created_at) == year,
#         extract('month', MeterUsage.created_at) == month
#     ).first()

#     if usage:
#         # Return existing meter usage for the month
#         return {
#             "meter_id": usage.meter_id,
#             "meter_start": usage.meter_start,
#             "meter_end": usage.meter_end,
#             "meter_usage": usage.meter_usage,
#             "img_path": usage.img_path
#         }

#     # If no data for the selected month, provide last month's end as start
#     latest_usage = db.query(MeterUsage).filter(
#         MeterUsage.meter_id == meter_id,
#         MeterUsage.deleted_at.is_(None)
#     ).order_by(MeterUsage.created_at.desc()).first()

#     return {
#         "meter_id": meter_id,
#         "meter_start": latest_usage.meter_end if latest_usage else 0,
#         "meter_end": None,
#         "meter_usage": 0,
#         "img_path": None
#     }
@app.get("/api/meter_usages_month/{month}")
def get_meter_usages(month: str, db: Session = Depends(get_db)):
    """
    Fetch meter usage data for a given month.
    """
    from sqlalchemy import func, and_, extract
    from datetime import datetime

    # Parse month input
    try:
        year, month = map(int, month.split("-"))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM.")

    # Subquery: Last confirmed or previous meter_end per meter
    subquery_last_end = (
        db.query(
            MeterUsage.meter_id,
            func.max(MeterUsage.date_check).label("last_date_check"),
            func.max(MeterUsage.meter_end).label("last_meter_end")
        )
        .filter(
            MeterUsage.deleted_at.is_(None),
            MeterUsage.status == "CONFIRMED"  # Only consider CONFIRMED records
        )
        .group_by(MeterUsage.meter_id)
        .subquery()
    )

    # Main query: Fetch meter data for the given month
    query = (
        db.query(
            Meter,
            MeterUsage.id.label("meter_usage_id"),
            MeterUsage.meter_start,
            MeterUsage.meter_end,
            MeterUsage.meter_usage,
            MeterUsage.img_path,
            MeterUsage.status,
            MeterUsage.client_id,
            MeterUsage.company_id,
            MeterUsage.created_by,
            MeterUsage.confirmed_by,
            MeterUsage.created_at,
            MeterUsage.updated_at,
            MeterUsage.deleted_at,
            MeterUsage.date_check,
            MeterUsage.note,
            subquery_last_end.c.last_meter_end.label("default_meter_start")
        )
        .outerjoin(
            MeterUsage,
            and_(
                Meter.id == MeterUsage.meter_id,
                extract("year", MeterUsage.date_check) == year,
                extract("month", MeterUsage.date_check) == month,
                MeterUsage.deleted_at.is_(None)
            )
        )
        .outerjoin(
            subquery_last_end,
            Meter.id == subquery_last_end.c.meter_id
        )
    )

    # Process query results
    results = []
    for row in query.all():
        meter_start = (
            row.default_meter_start if row.status == "UNCONFIRMED" else row.meter_start
        )
        results.append({
            "meter_id": row.Meter.id,
            "meter_type": row.Meter.meter_type,
            "meter_number": row.Meter.meter_number,
            "meter_serial": row.Meter.meter_serial,
            "meter_asset_tag": row.Meter.asset_tag,
            "note": row.Meter.note,
            "meter_start": meter_start if meter_start is not None else 0,
            "meter_end": row.meter_end,
            "meter_usage": row.meter_usage,
            "img_path": row.img_path,
            "status": row.status,
            "client_id": row.client_id,
            "company_id": row.company_id,
            "created_by": row.created_by,
            "confirmed_by": row.confirmed_by,
            "created_at": row.created_at,
            "updated_at": row.updated_at,
            "deleted_at": row.deleted_at,
            "date_check": row.date_check,
            "meter_usage_id": row.meter_usage_id,
            "note": row.note
        })

    return results


@app.get("/api/tenants-find-cus-code/{customer_code}")
def get_tenant_by_customer_code(customer_code: str, db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(Tenant.code == customer_code).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found with the provided customer_code.")
    return tenant



class LineUpdate(BaseModel):
    customer_code: str
    line_img: str
    line_name: str
    line_id: str


@app.post("/api/tenants/line-connect")
def update_tenant_from_line(line_data: LineUpdate, db: Session = Depends(get_db)):
    # Find the tenant by customer_code
    tenant = db.query(Tenant).filter(Tenant.code == line_data.customer_code).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found with the provided customer_code.")
    
    # Update tenant fields
    tenant.line_img = line_data.line_img
    tenant.line_name = line_data.line_name
    tenant.line_id = line_data.line_id
    tenant.line_register = True

    # Commit changes
    db.commit()
    db.refresh(tenant)

    # Send a rich message via LINE Messaging API
    send_line_flex_message(tenant.line_id)

    return {"message": "Tenant updated successfully", "tenant": tenant}



class LockReserveCreate(BaseModel):
    lock_id: int
    status: Optional[str] = "new"
    contract_name: Optional[str]
    deposit: Optional[float] = 0.0
    advance: Optional[float] = 0.0
    contract_type : Optional[str]
    contract_number : Optional[str]
    contract_note : Optional[str]

class LockReserveUpdate(BaseModel):
    deleted_at: str
@app.get("/api/locks-reserves")
def read_locks_with_reserves(db: Session = Depends(get_db)):
    """
    Fetch locks and their associated reserves grouped by lock_id,
    filtering out reserves where deleted_at IS NOT NULL, 
    and include associated attachments.
    """
    # Query locks with joined lock reserves and their attachments
    locks = db.query(Lock).options(
        joinedload(Lock.lock_reserves.and_(LockReserve.deleted_at.is_(None)))
        .joinedload(LockReserve.attachments)  # Load attachments for each reserve
    ).order_by(Lock.id).all()

    # Structure the response data
    result = [
        {
            "lock_id": lock.id,
            "lock_name": lock.lock_name,
            "lock_reserves": [
                {
                    "id": reserve.id,
                    "status": reserve.status,
                    "contract_name": reserve.contract_name,
                    "client_id": reserve.client_id,
                    "company_id": reserve.company_id,
                    "created_at": reserve.created_at,
                    "deposit": reserve.deposit,
                    "advance": reserve.advance,
                    "contract_number": reserve.contract_number,
                    "contract_note": reserve.contract_note,
                    "attachments": [
                        {
                            "id": attachment.id,
                            "filename": attachment.filename,
                            "path": attachment.path,
                            "created_at": attachment.created_at,
                        }
                        for attachment in reserve.attachments
                    ],
                }
                for reserve in lock.lock_reserves
            ]
        }
        for lock in locks
    ]

    return {"data": result}

@app.post("/api/lock-reserves", response_model=dict)
def add_lock_reserve(reserve: LockReserveCreate, db: Session = Depends(get_db)):
    """
    Add a new lock reserve.
    """
    new_reserve = LockReserve(
        lock_id=reserve.lock_id,
        status=reserve.status,
        contract_name=reserve.contract_name,
        client_id=1,
        company_id=1,
        deposit=reserve.deposit,
        advance=reserve.advance,
        contract_type=reserve.contract_type,
        contract_number=reserve.contract_number,
        contract_note=reserve.contract_note,
    )
    db.add(new_reserve)
    db.commit()
    db.refresh(new_reserve)
    return {
        "message": "Lock reserve added successfully",
        "id": new_reserve.id,
        "reserve": {
            "lock_id": new_reserve.lock_id,
            "status": new_reserve.status,
            "contract_name": new_reserve.contract_name,
            "client_id": new_reserve.client_id,
            "company_id": new_reserve.company_id,
            "deposit": new_reserve.deposit,
            "advance": new_reserve.advance,
            "contract_type": new_reserve.contract_type,
            "contract_number": new_reserve.contract_number,
            "contract_note": new_reserve.contract_note,
            "created_at": new_reserve.created_at,
        },
    }


@app.put("/api/lock-reserves/{reserve_id}", response_model=dict)
def remove_lock_reserve(reserve_id: int, update: LockReserveUpdate, db: Session = Depends(get_db)):
    """
    Remove a lock reserve (soft delete).
    """
    try:
        reserve = db.query(LockReserve).filter(LockReserve.id == reserve_id).first()
        if not reserve:
            raise HTTPException(status_code=404, detail="Lock reserve not found")

        # Convert `deleted_at` to a valid datetime object if it's not already
        reserve.deleted_at = datetime.now()  # Assign current timestamp
        db.commit()
        db.refresh(reserve)

        return {"message": "Lock reserve removed successfully", "reserve": reserve}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove lock reserve: {str(e)}")


class LockReserveAttachmentBase(BaseModel):
    filename: str
    path: str


class LockReserveAttachmentCreate(LockReserveAttachmentBase):
    pass









@app.post("/api/lock-reserves/{lock_reserve_id}/attachments")
def upload_attachment(
    lock_reserve_id: int,
    file: UploadFile,
    db: Session = Depends(get_db)
):
    # Generate a unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save the file to the server
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Add file metadata to the database
    attachment = LockReserveAttachment(
        lock_reserve_id=lock_reserve_id,
        filename=unique_filename,
        path=file_path,
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return attachment


@app.get("/api/locks-reserves/{lock_id}/history")
def read_locks_with_reserves(lock_id: int, db: Session = Depends(get_db)):
    """
    Fetch lock and its associated reserves grouped by lock_id,
    filtering out reserves where deleted_at IS NOT NULL, 
    and include associated attachments.
    """
    # Query the lock with the specified lock_id
    lock = db.query(Lock).options(
        joinedload(Lock.lock_reserves)
        .joinedload(LockReserve.attachments)  # Load attachments for each reserve
    ).filter(Lock.id == lock_id).first()

    if not lock:
        return {"message": f"Lock with ID {lock_id} not found", "data": []}

    # Structure the response data for the specific lock
    result = {
        "lock_id": lock.id,
        "lock_name": lock.lock_name,
        "lock_reserves": [
            {
                "id": reserve.id,
                "status": reserve.status,
                "contract_name": reserve.contract_name,
                "client_id": reserve.client_id,
                "company_id": reserve.company_id,
                "created_at": reserve.created_at,
                "deposit": reserve.deposit,
                "advance": reserve.advance,
                "contract_number": reserve.contract_number,
                "contract_note": reserve.contract_note,
                "attachments": [
                    {
                        "id": attachment.id,
                        "filename": attachment.filename,
                        "path": f"http://37.27.181.156:18992/uploads/{attachment.filename}",
                        "created_at": attachment.created_at,
                    }
                    for attachment in reserve.attachments
                ],
            }
            for reserve in lock.lock_reserves
        ]
    }

    return {"data": result}


# Models
class MeterUpdateData(BaseModel):
    meter_usage_id: Optional[int] = None
    meter_id: Optional[int] = None
    meter_start: int
    meter_end: int
    note: str


class MeterUsageUpdate(BaseModel):
    month: str
    data: List[MeterUpdateData]


@app.put("/api/meter_usages/update")
def update_meter_usage(
    meter_update: MeterUsageUpdate = Body(...),
    db: Session = Depends(get_db)
):
    """
    Update or create meter usages based on the provided data.
    """
    results = []
    try:
        # Iterate over the data to update or create meter usage
        for item in meter_update.data:
            if item.meter_usage_id:
                # Fetch the meter usage record by ID
                meter_usage = db.query(MeterUsage).filter(MeterUsage.id == item.meter_usage_id).first()

                # If meter usage record not found, raise an error
                if not meter_usage:
                    raise HTTPException(status_code=404, detail=f"Meter usage ID {item.meter_usage_id} not found")

                # Update the fields
                meter_usage.meter_start = item.meter_start
                meter_usage.meter_end = item.meter_end
                meter_usage.meter_usage = item.meter_end - item.meter_start
                meter_usage.note = item.note
                meter_usage.status = "CONFIRMED"
                meter_usage.updated_at = datetime.utcnow()

            else:
                # Create a new MeterUsage record if meter_usage_id is null
                meter_usage = MeterUsage(
                    meter_id=item.meter_id,
                    meter_start=item.meter_start,
                    meter_end=item.meter_end,
                    meter_usage=item.meter_end - item.meter_start,
                    note=item.note,
                    status="CONFIRMED",
                    date_check=f"{meter_update.month}-01",  # Assuming month format is 'YYYY-MM'
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
                db.add(meter_usage)

            # Add the record details to the results
            results.append({
                "meter_usage_id": meter_usage.id,
                "meter_id": meter_usage.meter_id,
                "meter_start": meter_usage.meter_start,
                "meter_end": meter_usage.meter_end,
                "meter_usage": meter_usage.meter_usage,
                "note": meter_usage.note,
                "status": meter_usage.status,
                "updated_at": meter_usage.updated_at,
                "created_at": meter_usage.created_at,
                "date_check": meter_usage.date_check,
            })

        # Commit the changes to the database
        db.commit()

    except Exception as e:
        # Rollback in case of any error
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Meter usages updated successfully", "data": results}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=4000, reload=True, workers=1)
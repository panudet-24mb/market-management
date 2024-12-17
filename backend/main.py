from fastapi import FastAPI, HTTPException, Depends
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from typing import List
from fastapi.staticfiles import StaticFiles
from database import SessionLocal, engine
from models import Base , Tenant, Lock, Contract, Document, Bill, Zone
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
        note=note
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
    contracts = (
        db.query(Contract)
        .options(joinedload(Contract.documents))  # Eagerly load documents for contracts
        .filter(Contract.tenant_id == tenant_id)
        .all()
    )

    if not contracts:
        raise HTTPException(status_code=200, detail="No contracts found for this tenant.")

    # Construct the response with documents included
    result = []
    for contract in contracts:
        result.append({
            "id": contract.id,
            "lock_id": contract.lock_id,
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4000)


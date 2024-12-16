from fastapi import FastAPI, HTTPException, Depends
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
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

UPLOAD_DIR = "./uploads"


Base.metadata.create_all(bind=engine)

app = FastAPI()

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
@app.get("/api/contracts/tenant/{tenant_id}")
def get_contracts_by_tenant_api(tenant_id: int, db: Session = Depends(get_db)):
    return get_contracts_by_tenant(db, tenant_id)

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


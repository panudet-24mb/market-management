from sqlalchemy.orm import Session
from models import Tenant, Lock, Contract, Document, Bill , Zone
from fastapi.encoders import jsonable_encoder
# CRUD for Tenant
from datetime import datetime

def create_tenant(db: Session, tenant_data: dict):
    # Create the tenant object without code initially
    tenant = Tenant(**tenant_data)
    db.add(tenant)
    db.commit()  # Commit to generate the `id`
    db.refresh(tenant)

    # Generate the tenant code in the required format
    current_date = datetime.now().strftime('%y%m%d')  # YYMMDD format
    tenant.code = f"C{current_date}-{str(tenant.id).zfill(5)}"  # CYYMMDD-{00000}

    # Update the tenant with the generated code
    db.add(tenant)
    db.commit()
    db.refresh(tenant)

    return tenant
def get_tenants(db: Session):
    return db.query(Tenant).all()

def get_tenant_by_id(db: Session, tenant_id: int):
    return db.query(Tenant).filter(Tenant.id == tenant_id).first()

# CRUD for Lock
def create_lock(db: Session, lock_data: dict):
    lock = Lock(**lock_data)
    
    db.add(lock)
    db.commit()
    db.refresh(lock)
    return lock

def get_locks(db: Session):
    query = db.query(Lock, Zone).join(Zone, Lock.zone_id == Zone.id).all()

    # Format the result into the desired response structure
    result = [
        {
            "id": lock.id,
            "size": lock.size,
            "active": lock.active,
            "lock_name": lock.lock_name,
            "lock_number": lock.lock_number,
            "status": lock.status,
            "zone_id": lock.zone_id,
            "zone_name": zone.name,
            "zone_pic": zone.pic  # Assuming `pic` is the field for the zone picture
        }
        for lock, zone in query
    ]

    return result

# CRUD for Contract
def create_contract(db: Session, contract_data: dict):
    contract = Contract(**contract_data)
    db.add(contract)
    db.commit()
    db.refresh(contract)
    return contract

def get_contracts_by_tenant(db: Session, tenant_id: int):
    return db.query(Contract).filter(Contract.tenant_id == tenant_id).all()

# CRUD for Bills
def create_bill(db: Session, bill_data: dict):
    bill = Bill(**bill_data)
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill



# CRUD for Zone
def create_zone(db: Session, zone_data: dict):
    zone = Zone(**zone_data)
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone

def get_zones(db: Session):
    return db.query(Zone).all()

def get_zone_by_id(db: Session, zone_id: int):
    return db.query(Zone).filter(Zone.id == zone_id).first()

def update_zone(db: Session, zone_id: int, zone_data: dict):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        return None
    for key, value in zone_data.items():
        setattr(zone, key, value)
    db.commit()
    db.refresh(zone)
    return zone

def delete_zone(db: Session, zone_id: int):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        return None
    db.delete(zone)
    db.commit()
    return zone
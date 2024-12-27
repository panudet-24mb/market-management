from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Text, DECIMAL,TIMESTAMP ,func ,DateTime
from sqlalchemy.orm import relationship
from database import Base
from pydantic import BaseModel
from datetime import datetime

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    contract_type = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    path = Column(String, nullable=False)

    contract = relationship("Contract", back_populates="documents")




class Zone(Base):
    __tablename__ = "zones"
    id = Column(Integer, primary_key=True, index=True)
    pic = Column(String)
    name = Column(String, nullable=False)
    status = Column(String)

    locks = relationship("Lock", back_populates="zone")

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String)
    prefix = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    nick_name = Column(String)
    contact = Column(String)
    phone = Column(String)
    address = Column(String)
    profile_image = Column(String)
    line_id = Column(String)
    note = Column(Text)
    line_name = Column(String)
    line_register = Column(Boolean)
    line_img = Column(String)

    # Relationships
    contracts = relationship("Contract", back_populates="tenant")
    bills = relationship("Bill", back_populates="tenant")  # Add this line
    notifications = relationship("BillHaveNotification", back_populates="tenant")  # Link to BillHaveNotification


class BindContractRequest(BaseModel):
    lock_id: int
    contract_id: int
    status: str = 'active'


# Lock Model
class Lock(Base):
    __tablename__ = "locks"

    id = Column(Integer, primary_key=True, index=True)
    lock_name = Column(String)
    lock_number = Column(String)
    size = Column(String)
    status = Column(String)
    active = Column(Boolean)

    # Relationships
    contracts = relationship("Contract", back_populates="lock")
    lock_contracts = relationship("LockHasContract", back_populates="lock")
    zone_id = Column(Integer, ForeignKey("zones.id"))
    zone = relationship("Zone", back_populates="locks")
    lock_reserves = relationship("LockReserve", back_populates="lock")  
    lock_meters = relationship("LockHasMeter", back_populates="lock")  # New relationship

# Contract Model
class Contract(Base):
    __tablename__ = "contracts"
    id = Column(Integer, primary_key=True, index=True)
    contract_number = Column(String, unique=True, nullable=False)
    contract_name = Column(String)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    lock_id = Column(Integer, ForeignKey("locks.id"))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String)
    rent_rate = Column(Integer)
    water_rate = Column(Integer)
    electric_rate = Column(Integer)
    advance = Column(Integer)
    deposit = Column(Integer)
    note = Column(Text)
    client_id = Column(Integer, nullable=True)
    company_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    tenant = relationship("Tenant", back_populates="contracts")
    lock = relationship("Lock", back_populates="contracts")
    lock_contracts = relationship("LockHasContract", back_populates="contract")
    documents = relationship("Document", back_populates="contract")  # Add this line

# LockHasContract Association Table
class LockHasContract(Base):
    __tablename__ = "lock_has_contracts"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    lock_id = Column(Integer, ForeignKey("locks.id"), nullable=False)
    status = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    lock = relationship("Lock", back_populates="lock_contracts")
    contract = relationship("Contract", back_populates="lock_contracts")


class Meter(Base):
    __tablename__ = "meters"

    id = Column(Integer, primary_key=True, index=True)
    meter_type = Column(String, nullable=False)
    meter_number = Column(String, nullable=False)
    meter_serial = Column(String, nullable=False, unique=True)
    note = Column(Text)
    asset_tag = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    meter_locks = relationship("LockHasMeter", back_populates="meter")  # New relationship


class MeterUsage(Base):
    __tablename__ = "meter_usages"

    id = Column(Integer, primary_key=True, index=True)
    meter_id = Column(Integer, ForeignKey("meters.id"), nullable=False)
    meter_start = Column(Integer, nullable=False)
    meter_end = Column(Integer, nullable=False)
    meter_usage = Column(Integer, nullable=False)
    note = Column(Text, nullable=True)
    img_path = Column(String, nullable=True)
    status = Column(String, nullable=True)
    client_id = Column(Integer, nullable=True)
    company_id = Column(Integer, nullable=True)
    created_by = Column(Integer, nullable=True)
    confirmed_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    date_check = Column(Date)
    
    bill_links = relationship("BillHaveMeterUsage", back_populates="meter_usage")



class LockReserve(Base):
    __tablename__ = "lock_reserves"

    id = Column(Integer, primary_key=True, index=True)
    lock_id = Column(Integer, ForeignKey("locks.id"), nullable=False) 
    status = Column(String, nullable=True)
    contract_name = Column(String, nullable=True)
    contract_type = Column(String, nullable=True)
    contract_number = Column(String, nullable=True)
    contract_note = Column(Text, nullable=True)
    client_id = Column(Integer, nullable=True)
    company_id = Column(Integer, nullable=True)
    deposit = Column(DECIMAL, nullable=True)
    advance = Column(DECIMAL, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP, nullable=True)

    #relation
    lock = relationship("Lock", back_populates="lock_reserves")
    attachments = relationship("LockReserveAttachment", back_populates="lock_reserve")

class LockReserveAttachment(Base):
    __tablename__ = "lock_reserves_has_attachments"

    id = Column(Integer, primary_key=True, index=True)
    lock_reserve_id = Column(Integer, ForeignKey("lock_reserves.id"), nullable=False)
    filename = Column(String, nullable=False)
    path = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    lock_reserve = relationship("LockReserve", back_populates="attachments")


class PreCalling(Base):
    __tablename__ = "pre_calling"
    id = Column(Integer, primary_key=True, index=True)
    call_number = Column(String, nullable=False)
    status = Column(String, nullable=True)
    client_id = Column(Integer, nullable=False)
    company_id = Column(Integer, nullable=True)
    note = Column(Text, nullable=True)
    created_by = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP, nullable=True)


class LockHasMeter(Base):
    __tablename__ = "lock_has_meter"

    id = Column(Integer, primary_key=True, index=True)
    lock_id = Column(Integer, ForeignKey("locks.id"), nullable=False)
    meter_id = Column(Integer, ForeignKey("meters.id"), nullable=False)
    status = Column(String, nullable=True)
    note = Column(Text, nullable=True)
    company_id = Column(Integer, nullable=True)
    client_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    lock = relationship("Lock", back_populates="lock_meters")
    meter = relationship("Meter", back_populates="meter_locks")


class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    bill_number = Column(String, unique=True, nullable=False)
    bill_type = Column(String, nullable=False)
    ref_number = Column(String, nullable=False)
    bill_name = Column(String, nullable=False)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    date_check = Column(Date, nullable=True)
    rent = Column(DECIMAL, nullable=True)
    water = Column(DECIMAL, nullable=True)
    water_usage = Column(DECIMAL, nullable=True)
    electric = Column(DECIMAL, nullable=True)
    electric_usage = Column(DECIMAL, nullable=True)
    vat = Column(DECIMAL, nullable=True)
    discount = Column(DECIMAL, nullable=True)
    total = Column(DECIMAL, nullable=True)
    total_vat = Column(DECIMAL, nullable=True)
    status = Column(String, nullable=True)
    confirm_by = Column(Integer, nullable=True)
    confirm_date = Column(Date, nullable=True)
    note = Column(Text, nullable=True)
    created_by = Column(Integer, nullable=True)
    client_id = Column(Integer, nullable=True)
    company_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    tenant = relationship("Tenant", back_populates="bills")
    contract = relationship("Contract")
    meter_usages = relationship("BillHaveMeterUsage", back_populates="bill")
    notifications = relationship("BillHaveNotification", back_populates="bill")
    transactions = relationship("BillHaveTransaction", back_populates="bill")





class BillHaveMeterUsage(Base):
    __tablename__ = "bill_have_meter_usages"

    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(Integer, ForeignKey("bills.id"), nullable=False)
    meter_usage_id = Column(Integer, ForeignKey("meter_usages.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    bill = relationship("Bill", back_populates="meter_usages")
    meter_usage = relationship("MeterUsage", back_populates="bill_links")


class BillHaveNotification(Base):
    __tablename__ = "bill_have_notification"

    id = Column(Integer, primary_key=True, index=True)
    notification_code = Column(String(255), nullable=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    bill_id = Column(Integer, ForeignKey("bills.id"), nullable=False)
    sent_to = Column(String(255), nullable=True)
    notification_type = Column(String(255), nullable=True)
    note = Column(Text, nullable=True)
    payload = Column(Text, nullable=True)
    notification_channel = Column(String(255), nullable=True)
    is_sent = Column(Boolean, default=False)
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    bill = relationship("Bill", back_populates="notifications")
    tenant = relationship("Tenant", back_populates="notifications")

class BillHaveTransaction(Base):
    __tablename__ = "bill_have_transactions"

    id = Column(Integer, primary_key=True, index=True)
    txn_number = Column(String(255), nullable=True)
    bill_id = Column(Integer, ForeignKey("bills.id"), nullable=True)
    ref_number = Column(String(255), nullable=True)
    transaction_type = Column(String(255), nullable=True)
    amount = Column(DECIMAL, nullable=True)
    transaction_date = Column(Date, nullable=True)
    status = Column(String(255), nullable=True)
    note = Column(Text, nullable=True)
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    bill = relationship("Bill", back_populates="transactions")
    attachments = relationship("TransactionHaveAttachment", back_populates="transaction")


class TransactionHaveAttachment(Base):
    __tablename__ = "transaction_have_attachments"

    id = Column(Integer, primary_key=True, index=True)
    bill_have_transactions_id = Column(Integer, ForeignKey("bill_have_transactions.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    path = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    transaction = relationship("BillHaveTransaction", back_populates="attachments")
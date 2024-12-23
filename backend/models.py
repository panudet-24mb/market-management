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

class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    month = Column(String, nullable=False)
    rent = Column(DECIMAL)
    water = Column(DECIMAL)
    electric = Column(DECIMAL)
    discount = Column(DECIMAL)
    total = Column(DECIMAL)

    tenant = relationship("Tenant", back_populates="bills")
    contract = relationship("Contract")



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
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)


class MeterUsage(Base):
    __tablename__ = "meter_usages"

    id = Column(Integer, primary_key=True, index=True)
    meter_id = Column(Integer, ForeignKey("meters.id"), nullable=False)
    meter_start = Column(Integer, nullable=False)
    meter_end = Column(Integer, nullable=False)
    meter_usage = Column(Integer, nullable=False)
    note = Column(Text, nullable=True)
    img_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

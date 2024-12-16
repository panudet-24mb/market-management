from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Text, DECIMAL
from sqlalchemy.orm import relationship
from database import Base

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False)
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

    contracts = relationship("Contract", back_populates="tenant")
    bills = relationship("Bill", back_populates="tenant")

class Lock(Base):
    __tablename__ = "locks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    lock_number = Column(String)
    zone_id = Column(Integer, ForeignKey("zones.id", ondelete="SET NULL"), nullable=True)
    size = Column(String)
    status = Column(String)
    active = Column(Boolean)
    contracts = relationship("Contract", back_populates="lock")

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    contract_number = Column(String, unique=True, nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    lock_id = Column(Integer, ForeignKey("locks.id"))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String)
    rent_rate = Column(DECIMAL)
    water_rate = Column(DECIMAL)
    electric_rate = Column(DECIMAL)

    tenant = relationship("Tenant", back_populates="contracts")
    lock = relationship("Lock", back_populates="contracts")
    documents = relationship("Document", back_populates="contract")

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

    

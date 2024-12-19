from sqlalchemy.orm import Session
from models import Meter, MeterUsage
from datetime import datetime
from sqlalchemy import func

# Meters
def create_meter(db: Session, meter_data: dict):
    meter = Meter(**meter_data)
    db.add(meter)
    db.commit()
    db.refresh(meter)
    return meter

def get_meters(db: Session):
    return db.query(Meter).filter(Meter.deleted_at.is_(None)).all()

def get_meter_by_id(db: Session, meter_id: int):
    return db.query(Meter).filter(Meter.id == meter_id, Meter.deleted_at.is_(None)).first()

def update_meter(db: Session, meter_id: int, meter_data: dict):
    meter = get_meter_by_id(db, meter_id)
    if meter:
        for key, value in meter_data.items():
            setattr(meter, key, value)
        meter.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(meter)
        return meter
    return None

def delete_meter(db: Session, meter_id: int):
    meter = get_meter_by_id(db, meter_id)
    if meter:
        meter.deleted_at = datetime.utcnow()
        db.commit()
        return meter
    return None

# Meter Usages
def create_meter_usage(db: Session, usage_data: dict):
    usage = MeterUsage(**usage_data)
    db.add(usage)
    db.commit()
    db.refresh(usage)
    return usage

def get_meter_usages(db: Session, meter_id: int):
    return db.query(MeterUsage).filter(MeterUsage.meter_id == meter_id, MeterUsage.deleted_at.is_(None)).all()

def validate_meter_usage(db: Session, meter_id: int, month: int, year: int):
    existing = db.query(MeterUsage).filter(
        MeterUsage.meter_id == meter_id,
        func.date_part('month', MeterUsage.created_at) == month,
        func.date_part('year', MeterUsage.created_at) == year,
        MeterUsage.deleted_at.is_(None)
    ).first()
    return existing is None

def get_latest_meter_usages(db: Session):
    subquery = (
        db.query(
            MeterUsage.meter_id,
            func.max(MeterUsage.created_at).label("max_created_at")
        )
        .group_by(MeterUsage.meter_id)
        .subquery()
    )
    latest_usages = (
        db.query(MeterUsage)
        .join(subquery, (MeterUsage.meter_id == subquery.c.meter_id) & (MeterUsage.created_at == subquery.c.max_created_at))
        .filter(MeterUsage.deleted_at.is_(None))
        .all()
    )
    return [{"meter_id": usage.meter_id, "meter_end": usage.meter_end, "img_path": usage.img_path} for usage in latest_usages]
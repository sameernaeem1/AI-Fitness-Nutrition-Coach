from pathlib import Path
import json

from backend.app.database import SessionLocal, engine, Base
from backend.app.models import Injury

BASE_DIR = Path(__file__).resolve().parent.parent
data_path = BASE_DIR / "data" / "injuries.json"

with open(data_path, "r") as file:
    injuries_data = json.load(file)

db = SessionLocal()

try:
    db.query(Injury).delete()
    db.commit()

    injuries = [Injury(name=item["name"]) for item in injuries_data]
    db.bulk_save_objects(injuries)
    db.commit()

finally:
    db.close()
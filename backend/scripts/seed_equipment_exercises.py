from pathlib import Path
import pandas as pd

from backend.app.database import SessionLocal, engine, Base
from backend.app.models import Equipment, Exercise

BASE_DIR = Path(__file__).resolve().parent.parent
data_path = BASE_DIR / "data" / "gym_exercises.xlsx"

df = pd.read_excel(data_path)
print(df.head())

df["Exercise_Name"] = df["Exercise_Name"].str.strip()
df["muscle_gp"] = df["muscle_gp"].str.strip()
df["Equipment"] = df["Equipment"].str.strip()

db = SessionLocal()

try:
    db.query(Exercise).delete()
    db.query(Equipment).delete()
    db.commit()

    equipment_assignment = {}

    for name in sorted(df["Equipment"].unique()):
        equipment = Equipment(name=name)
        db.add(equipment)
        db.flush()
        equipment_assignment[name] = equipment.id
    
    db.commit()

    exercises = []

    for i, row in df.iterrows():
        exercise = Exercise(
            name=row["Exercise_Name"],
            target_muscle=row["muscle_gp"],
            difficulty_tier=None,
            equipment_id=equipment_assignment.get(row["Equipment"])
        )
        exercises.append(exercise)
    
    db.bulk_save_objects(exercises)
    db.commit()

finally:
    db.close()
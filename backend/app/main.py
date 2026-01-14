import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.database import Base, engine
import backend.app.models as models
from backend.app.routes import auth, workouts

app = FastAPI()

app.include_router(auth.router)
app.include_router(workouts.router)

@app.get("/")
def root():
    return{"message": "Hello World"}

if __name__ == "__main__":
    #Base.metadata.drop_all(bind=engine)
    #Base.metadata.create_all(bind=engine)
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
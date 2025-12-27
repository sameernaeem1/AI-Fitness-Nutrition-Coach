import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
import models

app = FastAPI()

@app.get("/")
def root():
    return{"message": "Hello World"}

if __name__ == "__main__":
    #Base.metadata.create_all(bind=engine)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
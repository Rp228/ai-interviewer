from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class StartRequest(BaseModel):
    session_id: str
    topic: str

@app.post("/start")
async def start_interview(req: StartRequest):
    return {"received": req}

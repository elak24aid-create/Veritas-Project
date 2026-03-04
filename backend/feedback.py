from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class FeedbackInput(BaseModel):
    type: str
    message: str
    timestamp: str = None

@router.post("/submit")
async def submit_feedback(feedback: FeedbackInput):
    # In a real app, this would be saved to a database
    # For now, we simulate success
    print(f"Feedback Received: {feedback.type} - {feedback.message}")
    return {
        "status": "success",
        "message": "Intelligence report received and queued for analysis.",
        "received_at": datetime.now().isoformat()
    }

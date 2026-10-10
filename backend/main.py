from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router
from detector import router as detector_router
from feedback import router as feedback_router
import nltk

app = FastAPI(title="TruthLens: AI Truth Verification Platform")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(detector_router, prefix="/api", tags=["Detection"])
app.include_router(feedback_router, prefix="/api/feedback", tags=["Feedback"])

@app.get("/")
async def root():
    return {
        "message": "TruthLens API is running",
        "app": "TruthLens",
        "version": "2.4",
        "status": "online"
    }

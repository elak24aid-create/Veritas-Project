from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router
from detector import router as detector_router
from feedback import router as feedback_router
import nltk

# Pre-download required NLTK data for TextBlob
try:
    nltk.download('punkt')
    nltk.download('punkt_tab')
    nltk.download('averaged_perceptron_tagger')
    nltk.download('brown')
    nltk.download('wordnet')
except Exception as e:
    print(f"NLTK Download failed: {e}")

app = FastAPI(title="Veritas: AI Fake News Detector")

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
    return {"message": "Veritas API is running"}

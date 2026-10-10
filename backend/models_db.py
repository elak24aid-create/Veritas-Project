from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime
from datetime import datetime
from database import Base

class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Agent")
    created_at = Column(DateTime, default=datetime.utcnow)

class DetectionHistoryDB(Base):
    __tablename__ = "detection_history"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True, nullable=False)
    input_type = Column(String, default="Text") # Text, URL, Image, Audio
    content = Column(Text, nullable=False)
    prediction = Column(String, nullable=False) # Real or Fake
    probability = Column(Float, nullable=False)
    sentiment = Column(String, default="Neutral")
    credibility_score = Column(Float, default=5.0)
    reasons_json = Column(Text, nullable=True)
    timestamp = Column(String, default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

class DailyNewsDB(Base):
    __tablename__ = "daily_news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, default="General Science & World")
    source_name = Column(String, nullable=False)
    source_url = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    is_verified = Column(Boolean, default=True)
    published_date = Column(String, default=lambda: datetime.now().strftime("%B %d, %Y"))

class ResearchCacheDB(Base):
    __tablename__ = "research_cache"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, unique=True, index=True, nullable=False)
    summary = Column(Text, nullable=False)
    citations_json = Column(Text, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)

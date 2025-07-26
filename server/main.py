from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from routes.insights import router as insights_router
from auth_middleware import get_current_user, get_current_user_optional
from firestore_service import firestore_service
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Raseed API", version="1.0.0")

# Configure CORS with authentication support
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with prefix
app.include_router(insights_router, prefix="/api/insights")

# Get database reference
db = firestore_service.db

@app.get("/")
async def root():
    return {"message": "Raseed API is running with Google Cloud OAuth"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "auth": "google-oauth"}

class UserProfile(BaseModel):
    name: str = ""
    email: str = ""
    preferred_currency: str = ""
    budget_monthly: int = 0
    created_at: str = ""
    fhs_score: Optional[float] = None
    pantry_enabled: Optional[bool] = None
    price_sensitivity_score: Optional[float] = None
    behavior_summary: Optional[str] = ""
    savings_pct: Optional[float] = None
    uid: Optional[str] = None

@app.get("/user/{uid}")
async def get_user(uid: str):
    """Get user profile by UID"""
    try:
        user_data = firestore_service.get_user(uid)
        if not user_data:
            return {
                "success": False,
                "error": "User not found",
                **UserProfile().model_dump()
            }
        
        user_data["success"] = True
        return user_data
    except Exception as e:
        print(f"Exception in get_user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/user/{uid}")
async def update_user(uid: str, profile: UserProfile):
    """Update user profile"""
    try:
        data = profile.model_dump()
        data['uid'] = uid  # Ensure uid is set correctly
        
        success = firestore_service.create_or_update_user(uid, data)
        if success:
            return {"success": True, "uid": uid}
        else:
            raise HTTPException(status_code=500, detail="Failed to update user")
    except Exception as e:
        print(f"Exception in update_user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/receipts/{uid}")
async def get_receipts(uid: str):
    """Get receipts for a user"""
    try:
        receipts = firestore_service.get_user_receipts(uid)
        return {"success": True, "receipts": receipts}
    except Exception as e:
        print(f"Exception in get_receipts: {str(e)}")
        return {"success": False, "error": str(e), "receipts": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

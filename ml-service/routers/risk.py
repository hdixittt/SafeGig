from fastapi import APIRouter
from pydantic import BaseModel
from ml_core import predict_risk

router = APIRouter()

# Risk tier mapping
RISK_TIERS = [
    {"max_score": 0.25, "tier": "Low",      "premium": 29,  "coverage": 800},
    {"max_score": 0.50, "tier": "Standard", "premium": 49,  "coverage": 1500},
    {"max_score": 0.75, "tier": "High",     "premium": 79,  "coverage": 2500},
    {"max_score": 1.00, "tier": "Premium",  "premium": 89,  "coverage": 3500},
]

class RiskInput(BaseModel):
    city: str
    pin_code: str
    platform: str
    weekly_hours: float

@router.post("/risk-score")
def compute_risk_score(data: RiskInput):
    """
    Compute AI risk score using Scikit-Learn RandomForestRegressor model.
    Dynamically adjusts premium based on worker location (e.g. water-logging safe zones).
    """
    try:
        risk_score, is_safe = predict_risk(data.city, data.platform, data.weekly_hours, data.pin_code)
    except Exception as e:
        print("ML Model Inference Failed:", e)
        risk_score, is_safe = 0.5, 0  # Fallback
        
    risk_score = round(min(risk_score, 1.0), 3)

    # Determine tier
    tier_info = next(t for t in RISK_TIERS if risk_score <= t["max_score"])
    
    premium = tier_info["premium"]
    coverage = tier_info["coverage"]
    
    # Apply dynamic pricing logic exactly as requested: charges ₹2 less per week if in safe zone
    if is_safe:
        premium -= 2
        
    return {
        "risk_score": risk_score,
        "tier": tier_info["tier"],
        "premium": max(premium, 19),  # Give a floor of 19
        "coverage": coverage,
        "city": data.city,
        "pin_code": data.pin_code,
        "is_safe_zone": bool(is_safe),
        "message": "₹2 Discount Applied for Operating in Historically Safe Zone" if is_safe else "Standard Compute"
    }

from fastapi import APIRouter
from pydantic import BaseModel
import numpy as np

router = APIRouter()

# Risk tier mapping
RISK_TIERS = [
    {"max_score": 0.25, "tier": "Low",      "premium": 29,  "coverage": 800},
    {"max_score": 0.50, "tier": "Standard", "premium": 49,  "coverage": 1500},
    {"max_score": 0.75, "tier": "High",     "premium": 79,  "coverage": 2500},
    {"max_score": 1.00, "tier": "Premium",  "premium": 89,  "coverage": 3500},
]

# City-level base risk (mock — replace with real historical data)
CITY_RISK = {
    "mumbai": 0.75, "delhi": 0.70, "bangalore": 0.45,
    "chennai": 0.60, "kolkata": 0.65, "hyderabad": 0.50,
    "pune": 0.40, "ahmedabad": 0.55,
}

class RiskInput(BaseModel):
    city: str
    pin_code: str
    platform: str
    weekly_hours: float

@router.post("/risk-score")
def compute_risk_score(data: RiskInput):
    """
    Compute AI risk score using city base risk + working hours factor.
    In production: replace with trained XGBoost model.
    """
    city_key = data.city.lower().strip()
    base_risk = CITY_RISK.get(city_key, 0.50)

    # Hours factor: more hours = more exposure
    hours_factor = min(data.weekly_hours / 60.0, 1.0) * 0.2

    # Platform factor (mock)
    platform_risk = {"zepto": 0.05, "blinkit": 0.03, "instamart": 0.04}.get(
        data.platform.lower(), 0.03
    )

    risk_score = round(min(base_risk + hours_factor + platform_risk, 1.0), 3)

    # Determine tier
    tier_info = next(t for t in RISK_TIERS if risk_score <= t["max_score"])

    return {
        "risk_score": risk_score,
        "tier": tier_info["tier"],
        "premium": tier_info["premium"],
        "coverage": tier_info["coverage"],
        "city": data.city,
        "pin_code": data.pin_code,
    }

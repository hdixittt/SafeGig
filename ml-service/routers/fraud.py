from fastapi import APIRouter
from pydantic import BaseModel
import math

router = APIRouter()

class FraudInput(BaseModel):
    policy_id: str
    trigger_id: str
    worker_id: str
    claim_frequency: int = 1
    weekly_hours: float = 40.0

@router.post("/fraud-score")
def compute_fraud_score(data: FraudInput):
    """
    Pure-Python fraud scoring — simulates Isolation Forest output.
    Score > 0.75 → manual review. Replace with real model when ready.
    """
    # Normal range: 1–2 claims/week. Each extra claim adds ~0.15 to score.
    base = min((data.claim_frequency - 1) * 0.15, 0.9)
    # Hours worked: very low hours with high claims is suspicious
    hours_penalty = max(0, (20 - data.weekly_hours) / 100) if data.claim_frequency > 2 else 0
    fraud_score = round(min(base + hours_penalty, 1.0), 3)

    return {
        "fraud_score": fraud_score,
        "flagged": fraud_score > 0.75,
        "recommendation": "manual_review" if fraud_score > 0.75 else "auto_approve",
    }

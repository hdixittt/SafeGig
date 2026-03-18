import os
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class SummaryInput(BaseModel):
    worker_name: str
    trigger_type: str
    city: str
    payout_amount: float
    policy_coverage: float

@router.post("/claim-summary")
def generate_claim_summary(data: SummaryInput):
    """
    Generate a human-readable claim summary using Gemini API.
    Falls back to a template if Gemini is unavailable.
    """
    trigger_labels = {
        "heavy_rain": "heavy rainfall",
        "extreme_heat": "extreme heat",
        "severe_pollution": "severe air pollution",
        "curfew_strike": "a local curfew/strike",
    }
    trigger_label = trigger_labels.get(data.trigger_type, data.trigger_type)

    try:
        import google.generativeai as genai
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        model = genai.GenerativeModel("gemini-pro")

        prompt = (
            f"Write a short, friendly 2-sentence SMS notification for a gig delivery worker named {data.worker_name} "
            f"in {data.city}. Their SafeGig insurance policy triggered due to {trigger_label}. "
            f"They will receive a payout of ₹{data.payout_amount:.0f} out of their ₹{data.policy_coverage:.0f} coverage. "
            f"Keep it warm, clear, and under 160 characters total."
        )
        response = model.generate_content(prompt)
        message = response.text.strip()
    except Exception:
        # Fallback template
        message = (
            f"Hi {data.worker_name}, {trigger_label.capitalize()} detected in {data.city}. "
            f"Your SafeGig policy has triggered a payout of ₹{data.payout_amount:.0f}. Payment initiated via UPI."
        )

    return {"message": message, "worker": data.worker_name, "amount": data.payout_amount}

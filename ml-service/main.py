from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import risk, fraud, summary

app = FastAPI(title="SafeGig ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(risk.router)
app.include_router(fraud.router)
app.include_router(summary.router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "safegig-ml"}

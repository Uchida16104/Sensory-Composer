from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analysis

app = FastAPI(
    title="Sensory Composer — Analysis Service",
    description="Python FastAPI microservice for audio and poem analysis.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis.router, prefix="/analysis", tags=["analysis"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "fastapi"}

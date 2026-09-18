from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.routes import router
from backend.app.core.config import load_settings
from backend.app.db.database import init_db

settings = load_settings()

app = FastAPI(
    title=settings["app_name"],
    version=settings["app_version"],
    description="Local-first PDF semantic help system. © 2026 APCA Systems — Developed by Suhib Asrawi.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:4173",
        "http://localhost:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
def _startup() -> None:
    init_db()

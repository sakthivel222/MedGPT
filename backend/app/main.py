from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import logging

from app.database import create_tables
from app.config import settings
from app.routers import auth, chat, upload, medical, admin, users

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting MedGPT API...")
    create_tables()
    logger.info("Database tables created.")
    yield
    logger.info("Shutting down MedGPT API...")


app = FastAPI(
    title="MedGPT API",
    description="Production-ready Medical AI Assistant API",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [
    "http://localhost:5173",
    "https://med-gpt-vsdb-rho.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(medical.router, prefix="/api/medical", tags=["Medical"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0", "service": "MedGPT"}


@app.get("/")
async def root():
    return {"message": "Welcome to MedGPT API", "docs": "/docs"}

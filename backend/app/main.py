from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import chat, files
from .core.config import settings

app = FastAPI(title=settings.app_name, version=settings.app_version)

# Configure CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

# Include routers
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(files.router, prefix="/api", tags=["files"])

@app.get("/")
async def root():
    return {"message": "Excel Processing API is running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "excel-processor"}
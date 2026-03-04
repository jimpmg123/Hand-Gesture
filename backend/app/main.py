from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.health import router as health_router
from app.routers.image import router as image_router

app = FastAPI(title="Travel From Photo API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 기본 루트 엔드포인트
@app.get("/")
def root():
    return {
        "message": "Travel From Photo API is running",
        "docs": "/docs",
        "health": "/api/health"
    }


app.include_router(health_router, prefix="/api")
app.include_router(image_router, prefix="/api")
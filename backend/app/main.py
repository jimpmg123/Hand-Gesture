from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.health import router as health_router
from app.routers.image import router as image_router

APP_TITLE = "Travel From Photo API"
API_PREFIX = "/api"
FRONTEND_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


def add_cors(app: FastAPI) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=FRONTEND_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def register_routes(app: FastAPI) -> None:
    @app.get("/")
    def root():
        return {
            "message": "Travel From Photo API is running",
            "docs": "/docs",
            "health": "/api/health",
        }

    app.include_router(health_router, prefix=API_PREFIX)
    app.include_router(image_router, prefix=API_PREFIX)


def create_app() -> FastAPI:
    app = FastAPI(title=APP_TITLE)
    add_cors(app)
    register_routes(app)
    return app


app = create_app()

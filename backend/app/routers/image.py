from fastapi import APIRouter, File, UploadFile

from app.schemas.image_metadata import ImageMetadataResponse
from app.services.image_ingestion_service import ingest_uploaded_file

router = APIRouter()


@router.post("/image", response_model=ImageMetadataResponse)
async def upload_image(file: UploadFile = File(...)):
    return await ingest_uploaded_file(file)

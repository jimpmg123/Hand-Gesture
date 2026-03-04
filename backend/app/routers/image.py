from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):

    return {
        "filename": file.filename,
        "content_type": file.content_type
    }
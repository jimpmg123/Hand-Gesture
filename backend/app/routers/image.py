from fastapi import APIRouter, File, Form, UploadFile

from app.services.search import analyze_uploaded_search_image

router = APIRouter()


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    country_hint: str | None = Form(default=None),
    city_hint: str | None = Form(default=None),
    user_hint: str | None = Form(default=None),
    force_openai_retry: bool = Form(default=False),
):
    analysis = await analyze_uploaded_search_image(
        file,
        country_hint=country_hint,
        city_hint=city_hint,
        user_hint=user_hint,
        force_openai_retry=force_openai_retry,
    )
    return analysis.to_dict()

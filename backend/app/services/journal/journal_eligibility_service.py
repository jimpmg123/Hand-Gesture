from __future__ import annotations

from app.services.journal.contracts import JournalImageInput, JournalImageRejection


# Check whether a single image can enter the Journal pipeline.
def evaluate_journal_image_eligibility(image: JournalImageInput) -> JournalImageRejection | None:
    if not image.has_exif_datetime:
        return JournalImageRejection(
            image_id=image.image_id,
            reason_code="missing_exif_datetime",
            reason="Journal requires an exact EXIF capture time.",
        )

    if not image.has_exif_gps:
        return JournalImageRejection(
            image_id=image.image_id,
            reason_code="missing_exif_gps",
            reason="Journal requires exact EXIF GPS coordinates.",
        )

    if image.captured_at is None:
        return JournalImageRejection(
            image_id=image.image_id,
            reason_code="missing_captured_at",
            reason="Journal requires a parsed capture timestamp.",
        )

    if image.latitude is None or image.longitude is None:
        return JournalImageRejection(
            image_id=image.image_id,
            reason_code="missing_coordinates",
            reason="Journal requires parsed EXIF coordinates.",
        )

    return None


# Filter the full input list down to Journal-eligible images and return rejection reasons too.
def filter_eligible_journal_images(
    images: list[JournalImageInput],
) -> tuple[list[JournalImageInput], list[JournalImageRejection]]:
    eligible: list[JournalImageInput] = []
    rejected: list[JournalImageRejection] = []

    for image in images:
        rejection = evaluate_journal_image_eligibility(image)
        if rejection is None:
            eligible.append(image)
        else:
            rejected.append(rejection)

    eligible.sort(key=lambda item: item.captured_at)
    return eligible, rejected

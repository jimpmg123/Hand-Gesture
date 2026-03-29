from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

from PIL import Image

DEFAULT_CLIP_MODEL_ID = "openai/clip-vit-base-patch32"
DEFAULT_PLACE_LABELS = [
    "train station",
    "airport terminal",
    "harbor",
    "beach",
    "lake",
    "pond",
    "river",
    "seashore",
    "mountain lakeside",
    "shrine waterfront",
    "temple grounds",
    "historic street",
    "city street",
    "restaurant interior",
    "street food market",
]
DEFAULT_ACTION_LABELS = [
    "no clear human action",
    "walking",
    "standing",
    "sitting",
    "swimming",
    "boating",
    "eating",
    "taking a photo",
    "riding a train",
]
DEFAULT_PEOPLE_COUNT_LABELS = [
    "no visible people",
    "one person",
    "two people",
    "three or more people",
]
DEFAULT_CLIP_LABELS = DEFAULT_PLACE_LABELS
DEFAULT_CLIP_LABEL_AXES = {
    "place": DEFAULT_PLACE_LABELS,
    "action": DEFAULT_ACTION_LABELS,
    "people_count": DEFAULT_PEOPLE_COUNT_LABELS,
}
AXIS_PROMPT_TEMPLATES = {
    "place": "a travel photo at a {label}",
    "action": "a travel photo showing {label}",
    "people_count": "a travel photo with {label}",
}


def _import_clip_dependencies():
    try:
        import torch
        from transformers import CLIPModel, CLIPProcessor
    except ImportError as exc:
        raise RuntimeError(
            "CLIP dependencies are not installed. Install 'torch' and 'transformers' in the backend venv first."
        ) from exc

    return torch, CLIPModel, CLIPProcessor


@lru_cache(maxsize=1)
def load_clip_model(model_id: str = DEFAULT_CLIP_MODEL_ID) -> dict[str, Any]:
    torch, CLIPModel, CLIPProcessor = _import_clip_dependencies()

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = CLIPModel.from_pretrained(model_id)
    processor = CLIPProcessor.from_pretrained(model_id)

    model.to(device)
    model.eval()

    return {
        "torch": torch,
        "device": device,
        "model": model,
        "processor": processor,
        "model_id": model_id,
    }


def _score_image_against_labels(
    image_path: str | Path,
    labels: list[str],
    prompt_template: str = "a travel photo of {label}",
    top_k: int = 5,
) -> dict[str, Any]:
    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError(f"Image file was not found: {path}")

    if not path.is_file():
        raise ValueError(f"Expected a file path, got: {path}")

    if not labels:
        raise ValueError("labels must contain at least one label.")

    clip_bundle = load_clip_model()
    torch = clip_bundle["torch"]
    device = clip_bundle["device"]
    model = clip_bundle["model"]
    processor = clip_bundle["processor"]

    prompts = [prompt_template.format(label=label) for label in labels]

    with Image.open(path) as image:
        image_rgb = image.convert("RGB")
        inputs = processor(text=prompts, images=image_rgb, return_tensors="pt", padding=True)

    inputs = {key: value.to(device) for key, value in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        probabilities = outputs.logits_per_image.softmax(dim=1)[0]

    scored_labels = [
        {
            "label": label,
            "prompt": prompt,
            "score": round(float(score), 6),
        }
        for label, prompt, score in zip(labels, prompts, probabilities.tolist(), strict=False)
    ]
    scored_labels.sort(key=lambda item: item["score"], reverse=True)

    top_matches = scored_labels[: max(top_k, 1)]

    return {
        "labels_tested": labels,
        "top_match": top_matches[0],
        "matches": top_matches,
    }


def analyze_image_with_clip(
    image_path: str | Path,
    candidate_labels: list[str] | None = None,
    top_k: int = 5,
) -> dict[str, Any]:
    path = Path(image_path)

    labels = candidate_labels or DEFAULT_CLIP_LABELS
    result = _score_image_against_labels(path, labels, top_k=top_k)
    clip_bundle = load_clip_model()

    return {
        "file_name": path.name,
        "absolute_path": str(path.resolve()),
        "model_id": clip_bundle["model_id"],
        "device": clip_bundle["device"],
        **result,
    }


def analyze_image_by_axes(
    image_path: str | Path,
    label_axes: dict[str, list[str]] | None = None,
    top_k: int = 3,
) -> dict[str, Any]:
    path = Path(image_path)

    axes = label_axes or DEFAULT_CLIP_LABEL_AXES
    if not axes:
        raise ValueError("label_axes must contain at least one axis.")

    clip_bundle = load_clip_model()
    axis_results: dict[str, Any] = {}
    summary: dict[str, str] = {}

    for axis_name, labels in axes.items():
        prompt_template = AXIS_PROMPT_TEMPLATES.get(axis_name, "a travel photo of {label}")
        axis_result = _score_image_against_labels(
            image_path=path,
            labels=labels,
            prompt_template=prompt_template,
            top_k=top_k,
        )
        axis_results[axis_name] = axis_result
        summary[axis_name] = axis_result["top_match"]["label"]

    return {
        "file_name": path.name,
        "absolute_path": str(path.resolve()),
        "model_id": clip_bundle["model_id"],
        "device": clip_bundle["device"],
        "summary": summary,
        "axes": axis_results,
    }

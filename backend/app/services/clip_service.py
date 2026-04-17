from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

from PIL import Image

DEFAULT_CLIP_MODEL_ID = "openai/clip-vit-base-patch32"

# Stage A: cheap gate to decide whether the image is worth location inference.
DEFAULT_GATE_LABELS = [
    "travel-relevant scene",
    "food close-up",
    "portrait or selfie",
    "close-up object",
    "indoor private scene",
]

# Stage B: broad scene hints only. These are weak priors, not final facts.
DEFAULT_SCENE_LABELS = [
    "urban street",
    "river scene",
    "sea or beach",
    "lake or waterfront",
    "temple or shrine",
    "historic site or ruin",
    "market street",
    "mountain landscape",
    "transport-related scene",
    "museum or gallery exterior",
]

DEFAULT_CLIP_LABELS = DEFAULT_SCENE_LABELS
DEFAULT_CLIP_LABEL_AXES = {
    "gate": DEFAULT_GATE_LABELS,
    "scene": DEFAULT_SCENE_LABELS,
}

AXIS_PROMPT_TEMPLATES = {
    "gate": "a travel photo showing {label}",
    "scene": "a travel photo of a {label}",
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


def _build_gate_summary(gate_result: dict[str, Any]) -> dict[str, Any]:
    top_match = gate_result["top_match"]
    top_label = top_match["label"]
    is_location_candidate = top_label == "travel-relevant scene"

    if is_location_candidate:
        decision = "pass"
        reason = "The image appears to contain enough public or environmental context for location inference."
    elif top_label == "indoor private scene":
        decision = "reject"
        reason = "The image looks like a private indoor scene with weak location context."
    else:
        decision = "reject"
        reason = "The image looks like a non-location photo and should be filtered before expensive reasoning."

    return {
        "label": top_label,
        "score": top_match["score"],
        "decision": decision,
        "is_location_candidate": is_location_candidate,
        "reason": reason,
    }


def _build_response_metadata(path: Path) -> dict[str, Any]:
    clip_bundle = load_clip_model()
    return {
        "file_name": path.name,
        "absolute_path": str(path.resolve()),
        "model_id": clip_bundle["model_id"],
        "device": clip_bundle["device"],
    }


def analyze_image_with_clip(
    image_path: str | Path,
    candidate_labels: list[str] | None = None,
    top_k: int = 5,
) -> dict[str, Any]:
    """
    Generic CLIP label ranking.

    Backward-compatible helper used when callers want to provide their own labels.
    If no labels are provided, this defaults to broad scene labels.
    """

    path = Path(image_path)
    labels = candidate_labels or DEFAULT_CLIP_LABELS
    result = _score_image_against_labels(path, labels, top_k=top_k)

    return {
        **_build_response_metadata(path),
        **result,
    }


def analyze_image_gate(
    image_path: str | Path,
    gate_labels: list[str] | None = None,
    top_k: int = 3,
) -> dict[str, Any]:
    path = Path(image_path)
    labels = gate_labels or DEFAULT_GATE_LABELS
    gate_result = _score_image_against_labels(
        image_path=path,
        labels=labels,
        prompt_template=AXIS_PROMPT_TEMPLATES["gate"],
        top_k=top_k,
    )

    return {
        **_build_response_metadata(path),
        **gate_result,
        "gate": _build_gate_summary(gate_result),
    }


def analyze_image_scene(
    image_path: str | Path,
    scene_labels: list[str] | None = None,
    top_k: int = 5,
) -> dict[str, Any]:
    path = Path(image_path)
    labels = scene_labels or DEFAULT_SCENE_LABELS
    scene_result = _score_image_against_labels(
        image_path=path,
        labels=labels,
        prompt_template=AXIS_PROMPT_TEMPLATES["scene"],
        top_k=top_k,
    )

    return {
        **_build_response_metadata(path),
        **scene_result,
    }


def analyze_image_by_axes(
    image_path: str | Path,
    label_axes: dict[str, list[str]] | None = None,
    top_k: int = 3,
) -> dict[str, Any]:
    """
    Full CLIP pass for the current project.

    Axis behavior:
    - gate: determines whether the image is suitable for location inference
    - scene: provides broad scene hints only
    """

    path = Path(image_path)

    axes = label_axes or DEFAULT_CLIP_LABEL_AXES
    if not axes:
        raise ValueError("label_axes must contain at least one axis.")

    axis_results: dict[str, Any] = {}
    summary: dict[str, Any] = {}

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

    gate_result = axis_results.get("gate")
    scene_result = axis_results.get("scene")
    gate_summary = _build_gate_summary(gate_result) if gate_result else None

    return {
        **_build_response_metadata(path),
        "summary": {
            **summary,
            "is_location_candidate": gate_summary["is_location_candidate"] if gate_summary else None,
            "gate_decision": gate_summary["decision"] if gate_summary else None,
        },
        "gate": gate_summary,
        "scene_hints": scene_result["matches"] if scene_result else [],
        "axes": axis_results,
    }


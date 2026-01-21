"""
Hugging Face Inference API client for fast ML inference.

Uses HF's free inference API to run models on their GPUs instead of local CPU.
Configure via HF_TOKEN and HF_ENABLED in .env file.
"""

import logging
from functools import lru_cache

import requests

from api.config import settings

logger = logging.getLogger(__name__)

# HF Inference API endpoint (router URL - new endpoint as of 2025)
HF_API_URL = "https://router.huggingface.co/hf-inference/models"


@lru_cache(maxsize=1)
def _get_hf_headers() -> dict[str, str] | None:
    """Get HF API headers if token is configured and enabled."""
    if not settings.HF_ENABLED:
        logger.info("[HF] Hugging Face Inference API disabled (HF_ENABLED=false)")
        return None
    if not settings.HF_TOKEN:
        logger.warning("[HF] No HF_TOKEN found - using local models (slow)")
        return None
    logger.info("[HF] Using Hugging Face Inference API (fast)")
    return {"Authorization": f"Bearer {settings.HF_TOKEN}"}


def hf_zero_shot_classification(
    text: str,
    labels: list[str],
    multi_label: bool = True,
) -> dict[str, float] | None:
    """
    Run zero-shot classification via HF Inference API.

    Returns dict of {label: score} or None if HF not available.
    Uses direct HTTP request to avoid huggingface_hub library bug in v0.36.0.
    """
    headers = _get_hf_headers()
    if not headers:
        return None

    try:
        # Direct API call to HF Inference API
        url = f"{HF_API_URL}/{settings.ZERO_SHOT_MODEL}"
        payload = {
            "inputs": text,
            "parameters": {
                "candidate_labels": labels,
                "multi_label": multi_label,
            },
        }

        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()

        result = response.json()
        logger.debug(f"[HF] Zero-shot API response: {result}")

        # Parse response - new router format: [{"label": "...", "score": ...}, ...]
        if isinstance(result, list) and all(
            isinstance(item, dict) and "label" in item and "score" in item for item in result
        ):
            scores = {item["label"]: item["score"] for item in result}
            logger.info(f"[HF] Zero-shot success: {len(scores)} labels")
            return scores
        # Legacy format: {"sequence": "...", "labels": [...], "scores": [...]}
        elif isinstance(result, dict) and "labels" in result and "scores" in result:
            scores = dict(zip(result["labels"], result["scores"]))
            logger.info(f"[HF] Zero-shot success: {len(scores)} labels")
            return scores
        else:
            logger.warning(f"[HF] Unexpected response format: {result}")
            return None

    except requests.exceptions.Timeout:
        logger.warning("[HF] Zero-shot API timeout")
        return None
    except requests.exceptions.HTTPError as e:
        logger.warning(f"[HF] Zero-shot API HTTP error: {e}")
        return None
    except Exception as e:
        logger.warning(f"[HF] Zero-shot API error: {e}")
        return None


def hf_zero_shot_classification_batch(
    texts: list[str],
    labels: list[str],
    multi_label: bool = True,
) -> list[dict[str, float] | None] | None:
    """
    Run zero-shot classification via HF Inference API for multiple texts in a batch.

    Returns list of {label: score} dicts or None if HF not available.
    This is ~10x faster than calling hf_zero_shot_classification for each text.
    """
    headers = _get_hf_headers()
    if not headers:
        return None

    if not texts:
        return []

    try:
        url = f"{HF_API_URL}/{settings.ZERO_SHOT_MODEL}"
        payload = {
            "inputs": texts,
            "parameters": {
                "candidate_labels": labels,
                "multi_label": multi_label,
            },
        }

        response = requests.post(url, headers=headers, json=payload, timeout=120)
        response.raise_for_status()

        results = response.json()
        logger.debug(f"[HF] Batch zero-shot API response type: {type(results)}")

        # Parse response - should be a list of results, one per input text
        parsed_results = []

        # Handle batch response format
        if isinstance(results, list):
            for result in results:
                if isinstance(result, list) and all(
                    isinstance(item, dict) and "label" in item and "score" in item
                    for item in result
                ):
                    # New router format: [{"label": "...", "score": ...}, ...]
                    scores = {item["label"]: item["score"] for item in result}
                    parsed_results.append(scores)
                elif isinstance(result, dict) and "labels" in result and "scores" in result:
                    # Legacy format: {"sequence": "...", "labels": [...], "scores": [...]}
                    scores = dict(zip(result["labels"], result["scores"]))
                    parsed_results.append(scores)
                else:
                    logger.warning(f"[HF] Unexpected result format in batch: {result}")
                    parsed_results.append(None)

        logger.info(f"[HF] Batch zero-shot success: {len(parsed_results)} results")
        return parsed_results

    except requests.exceptions.Timeout:
        logger.warning("[HF] Batch zero-shot API timeout")
        return None
    except requests.exceptions.HTTPError as e:
        logger.warning(f"[HF] Batch zero-shot API HTTP error: {e}")
        return None
    except Exception as e:
        logger.warning(f"[HF] Batch zero-shot API error: {e}")
        return None


def hf_text_classification(text: str, model: str) -> dict | None:
    """
    Run text classification via HF Inference API.

    Returns classification result or None if HF not available.
    """
    headers = _get_hf_headers()
    if not headers:
        return None

    try:
        url = f"{HF_API_URL}/{model}"
        response = requests.post(url, headers=headers, json={"inputs": text}, timeout=30)
        response.raise_for_status()

        result = response.json()
        # Result format: [[{"label": "...", "score": ...}, ...]]
        if result and isinstance(result, list) and len(result) > 0:
            if isinstance(result[0], list) and len(result[0]) > 0:
                return result[0][0]
            elif isinstance(result[0], dict):
                return result[0]
        return None
    except Exception as e:
        logger.warning(f"[HF] Text classification API error: {e}")
        return None


def is_hf_available() -> bool:
    """Check if HF Inference API is available and configured."""
    return _get_hf_headers() is not None

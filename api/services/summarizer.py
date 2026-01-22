"""
Ollama-based summarization service for generating AI summaries of comments.

Uses llama3.2:3b by default for fast, local summarization.
"""

import logging
from functools import lru_cache

import httpx

from api.config import settings

logger = logging.getLogger(__name__)


class Summarizer:
    """
    Generates AI summaries of comments using Ollama.

    Falls back gracefully when Ollama is not available.
    """

    def __init__(
        self,
        base_url: str | None = None,
        model: str | None = None,
        enabled: bool | None = None,
    ):
        self._base_url = base_url or settings.OLLAMA_URL
        self._model = model or settings.OLLAMA_MODEL
        self._enabled = enabled if enabled is not None else settings.OLLAMA_ENABLED
        self._available: bool | None = None
        logger.info(
            f"[Summarizer] Initialized with model={self._model}, "
            f"url={self._base_url}, enabled={self._enabled}"
        )

    @property
    def model_name(self) -> str:
        return self._model

    def is_available(self) -> bool:
        """Check if Ollama is available and enabled."""
        if not self._enabled:
            logger.info("[Summarizer] Ollama is disabled via settings")
            return False

        if self._available is not None:
            return self._available

        try:
            with httpx.Client(timeout=5.0) as client:
                response = client.get(f"{self._base_url}/api/tags")
                if response.status_code == 200:
                    self._available = True
                    logger.info("[Summarizer] Ollama is available")
                    return True
        except Exception as e:
            logger.warning(f"[Summarizer] Ollama not available: {e}")

        self._available = False
        return False

    async def summarize_comments(
        self,
        comments: list[str],
        sentiment: str,
        topics: list[str] | None = None,
    ) -> str | None:
        """
        Generate a 2-3 sentence summary of comments for a sentiment category.

        Args:
            comments: List of comment texts to summarize
            sentiment: The sentiment category (positive, negative, suggestion)
            topics: Optional list of detected topics for context

        Returns:
            Generated summary string or None if failed
        """
        if not self.is_available():
            return None

        if not comments:
            return None

        # Sample comments for context (limit to prevent token overflow)
        sample_size = min(20, len(comments))
        sampled = comments[:sample_size]

        # Build the prompt
        topic_context = ""
        if topics:
            topic_context = f"\nKey themes mentioned: {', '.join(topics[:5])}"

        sentiment_label = {
            "positive": "What People Liked",
            "negative": "Concerns and Criticisms",
            "suggestion": "Suggestions for Improvement",
        }.get(sentiment, sentiment.capitalize())

        prompt = f"""You are analyzing YouTube comments. Summarize the following {sentiment} comments in 2-3 sentences.
Focus on the main points viewers are expressing. Be specific and actionable.
{topic_context}

Comments ({len(comments)} total, showing {sample_size}):
{chr(10).join(f"- {c[:200]}" for c in sampled)}

Write a concise summary for the "{sentiment_label}" section (2-3 sentences only):"""

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self._base_url}/api/generate",
                    json={
                        "model": self._model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.7,
                            "num_predict": 150,
                        },
                    },
                )

                if response.status_code == 200:
                    data = response.json()
                    summary = data.get("response", "").strip()
                    if summary:
                        logger.info(
                            f"[Summarizer] Generated {sentiment} summary: {len(summary)} chars"
                        )
                        return summary
                else:
                    logger.warning(f"[Summarizer] Ollama returned status {response.status_code}")

        except Exception as e:
            logger.error(f"[Summarizer] Failed to generate summary: {e}")

        return None


@lru_cache(maxsize=1)
def get_summarizer() -> Summarizer:
    """Get or create cached Summarizer instance."""
    return Summarizer()

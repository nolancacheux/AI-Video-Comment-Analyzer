"""
Topic modeling using BERTopic with sentence embeddings.

Extracts meaningful topics from comment text using clustering
and provides semantic theme detection.
"""

import logging
import re
import time
from collections import Counter
from dataclasses import dataclass, field
from functools import lru_cache

from bertopic import BERTopic
from sentence_transformers import SentenceTransformer

from api.config import settings
from api.data import STOPWORDS, THEME_DISPLAY_NAMES, TOPIC_THEMES

logger = logging.getLogger(__name__)

# Regex pattern for word extraction (3+ letter words including accented chars)
WORD_PATTERN = re.compile(r"\b[a-zA-ZÀ-ÿ]{3,}\b")


@dataclass
class TopicResult:
    """Result from topic extraction."""

    topic_id: int
    name: str
    keywords: list[str]
    mention_count: int
    total_engagement: int
    sentiment_breakdown: dict[str, int] = field(default_factory=dict)
    comment_indices: list[int] = field(default_factory=list)


def extract_keywords_simple(texts: list[str], top_n: int = 5) -> list[str]:
    """Extract keywords using word frequency with stopword filtering."""
    words = []
    for text in texts:
        text_words = WORD_PATTERN.findall(text.lower())
        words.extend([w for w in text_words if w not in STOPWORDS and len(w) >= 3])

    word_counts = Counter(words)
    filtered = [(w, c) for w, c in word_counts.most_common(top_n * 2) if c >= 2]
    return [word for word, _ in filtered[:top_n]]


def detect_theme(text: str) -> str | None:
    """Detect semantic theme of text based on keyword matching."""
    text_lower = text.lower()
    theme_scores: dict[str, int] = {}

    for theme, keywords in TOPIC_THEMES.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            theme_scores[theme] = score

    if theme_scores:
        return max(theme_scores, key=lambda k: theme_scores[k])
    return None


def format_theme_name(theme: str) -> str:
    """Convert theme key to human-readable display name."""
    return THEME_DISPLAY_NAMES.get(theme, theme.replace("_", " ").title())


def validate_keywords(keywords: list[str]) -> list[str]:
    """Filter keywords to ensure quality."""
    valid = []
    for kw in keywords:
        kw_lower = kw.lower()
        if kw_lower in STOPWORDS:
            continue
        if len(kw) < 3:
            continue
        if kw.isdigit():
            continue
        valid.append(kw)
    return valid


def generate_topic_phrase(
    name: str, keywords: list[str], sample_texts: list[str] | None = None
) -> str:
    """
    Generate a meaningful phrase for a topic.

    Strategy:
    1. Use theme name if descriptive
    2. Extract most frequent bigram from sample texts
    3. Fall back to capitalized top keyword
    """
    theme_indicators = [
        "quality",
        "memories",
        "emotional",
        "lyrics",
        "performance",
        "appreciation",
        "discovery",
        "feedback",
        "production",
        "engagement",
    ]

    if name and not name.lower().startswith("topic ") and len(name) > 3:
        if any(word in name.lower() for word in theme_indicators):
            return name

    if sample_texts and len(sample_texts) >= 2:
        bigram_counts: Counter = Counter()
        for text in sample_texts[:10]:
            words = [w.lower() for w in WORD_PATTERN.findall(text) if w.lower() not in STOPWORDS]
            for i in range(len(words) - 1):
                bigram = f"{words[i]} {words[i + 1]}"
                bigram_counts[bigram] += 1

        common_bigrams = [bigram for bigram, count in bigram_counts.most_common(5) if count >= 2]
        if common_bigrams:
            return " ".join(word.capitalize() for word in common_bigrams[0].split())

    valid_keywords = [kw for kw in keywords if kw.lower() not in STOPWORDS]
    if valid_keywords:
        return valid_keywords[0].capitalize()

    if name:
        return name.capitalize()

    return "General Discussion"


class TopicModeler:
    """Topic modeling using BERTopic with sentence embeddings."""

    _instance: "TopicModeler | None" = None
    _model_loaded_at: float | None = None

    def __init__(self, embedding_model: str | None = None):
        self._embedding_model_name = embedding_model or settings.EMBEDDING_MODEL
        self._embedding_model = None
        self._topic_model = None
        logger.info("[Topics] TopicModeler initialized")

    @property
    def embedding_model(self) -> SentenceTransformer:
        """Lazy-load and cache the embedding model."""
        if self._embedding_model is None:
            logger.info(f"[Topics] Loading embedding model: {self._embedding_model_name}")
            start = time.time()
            self._embedding_model = SentenceTransformer(self._embedding_model_name)
            TopicModeler._model_loaded_at = time.time()
            logger.info(f"[Topics] Embedding model loaded in {time.time() - start:.2f}s")
        else:
            if TopicModeler._model_loaded_at:
                age = time.time() - TopicModeler._model_loaded_at
                logger.info(f"[Topics] Using cached embedding model (loaded {age:.0f}s ago)")
        return self._embedding_model

    def _create_topic_model(self, nr_topics: int | str = "auto", num_docs: int = 100) -> "BERTopic":
        """Create a BERTopic model with custom vectorizer."""
        from sklearn.feature_extraction.text import CountVectorizer

        min_df = 1 if num_docs < 20 else 2

        vectorizer = CountVectorizer(
            stop_words=list(STOPWORDS),
            min_df=min_df,
            max_df=0.95,
            ngram_range=(1, 2),
        )
        return BERTopic(
            embedding_model=self.embedding_model,
            nr_topics=nr_topics,
            calculate_probabilities=False,
            verbose=False,
            vectorizer_model=vectorizer,
        )

    def extract_topics(
        self,
        texts: list[str],
        engagement_scores: list[int] | None = None,
        sentiments: list[str] | None = None,
        min_topic_size: int | None = None,
        max_topics: int | None = None,
    ) -> list[TopicResult]:
        """
        Extract topics from texts using BERTopic.

        Args:
            texts: List of comment texts
            engagement_scores: Like counts for each comment
            sentiments: Sentiment labels for each comment
            min_topic_size: Minimum comments per topic
            max_topics: Maximum number of topics to return

        Returns:
            List of TopicResult objects sorted by engagement
        """
        start_time = time.time()

        if min_topic_size is None:
            min_topic_size = settings.TOPIC_MIN_COMMENTS
        if max_topics is None:
            max_topics = settings.MAX_TOPICS_ML

        logger.info(
            f"[Topics] Starting extraction for {len(texts)} comments "
            f"(min_size={min_topic_size}, max_topics={max_topics})"
        )

        if len(texts) < min_topic_size:
            logger.info(f"[Topics] Not enough texts: {len(texts)} < {min_topic_size}")
            return []

        if engagement_scores is None:
            engagement_scores = [1] * len(texts)

        if sentiments is None:
            sentiments = ["neutral"] * len(texts)

        unique_tokens = self._count_unique_tokens(texts)
        if len(unique_tokens) < 10:
            logger.info(f"[Topics] Insufficient vocabulary: {len(unique_tokens)} unique words")
            return []

        nr_topics = min(max_topics, max(2, len(texts) // min_topic_size))
        logger.info(f"[Topics] Target topics: {nr_topics}, vocabulary: {len(unique_tokens)}")

        try:
            topic_model, topics = self._fit_model(texts, nr_topics)
            topic_info = topic_model.get_topic_info()
            topic_info = topic_info[topic_info["Topic"] != -1]
            logger.info(f"[Topics] Found {len(topic_info)} clusters")
        except Exception as e:
            logger.warning(f"[Topics] Extraction failed: {e}")
            return []

        results = self._build_results(
            topic_info, topic_model, topics, texts, engagement_scores, sentiments
        )

        results.sort(key=lambda x: x.total_engagement, reverse=True)
        elapsed = time.time() - start_time
        logger.info(f"[Topics] Complete: {len(results[:max_topics])} topics in {elapsed:.2f}s")

        return results[:max_topics]

    def _count_unique_tokens(self, texts: list[str]) -> set[str]:
        """Count unique non-stopword tokens in texts."""
        unique_tokens = set()
        for text in texts:
            text_words = WORD_PATTERN.findall(text.lower())
            unique_tokens.update(w for w in text_words if w not in STOPWORDS)
        return unique_tokens

    def _fit_model(self, texts: list[str], nr_topics: int) -> tuple["BERTopic", list[int]]:
        """Fit BERTopic model and return topics."""
        logger.info("[Topics] Generating embeddings...")
        embed_start = time.time()
        topic_model = self._create_topic_model(nr_topics=nr_topics, num_docs=len(texts))
        topics, _ = topic_model.fit_transform(texts)
        logger.info(f"[Topics] BERTopic fit complete in {time.time() - embed_start:.2f}s")
        return topic_model, topics

    def _build_results(
        self,
        topic_info,
        topic_model: "BERTopic",
        topics: list[int],
        texts: list[str],
        engagement_scores: list[int],
        sentiments: list[str],
    ) -> list[TopicResult]:
        """Build TopicResult objects from BERTopic output."""
        results = []

        for _, row in topic_info.iterrows():
            topic_id = row["Topic"]
            topic_words = topic_model.get_topic(topic_id)

            raw_keywords = [word for word, _ in topic_words[:10]] if topic_words else []
            keywords = validate_keywords(raw_keywords)[:5]

            indices = [i for i, t in enumerate(topics) if t == topic_id]
            mention_count = len(indices)
            total_engagement = sum(engagement_scores[i] for i in indices)

            sentiment_counts = self._count_sentiments(indices, sentiments)
            name = self._generate_name(keywords, indices, texts)

            results.append(
                TopicResult(
                    topic_id=topic_id,
                    name=name,
                    keywords=keywords if keywords else ["general"],
                    mention_count=mention_count,
                    total_engagement=total_engagement,
                    sentiment_breakdown=sentiment_counts,
                    comment_indices=indices,
                )
            )
            logger.info(f"[Topics] Cluster {topic_id}: '{name}' with {mention_count} comments")

        return results

    def _count_sentiments(self, indices: list[int], sentiments: list[str]) -> dict[str, int]:
        """Count sentiment distribution for topic indices."""
        sentiment_counts: dict[str, int] = {}
        for idx in indices:
            sent = sentiments[idx] if idx < len(sentiments) else "neutral"
            sentiment_counts[sent] = sentiment_counts.get(sent, 0) + 1
        return sentiment_counts

    def _generate_name(self, keywords: list[str], indices: list[int], texts: list[str]) -> str:
        """Generate topic name from keywords or theme detection."""
        if keywords:
            return keywords[0].capitalize()

        cluster_texts = [texts[i] for i in indices]
        themes = [detect_theme(t) for t in cluster_texts]
        themes = [t for t in themes if t]

        if themes:
            most_common = Counter(themes).most_common(1)[0][0]
            return format_theme_name(most_common)

        return f"Topic {indices[0] + 1}" if indices else "General"


@lru_cache(maxsize=1)
def get_topic_modeler() -> TopicModeler:
    """Get or create cached TopicModeler instance."""
    logger.info("[Topics] Getting cached TopicModeler instance")
    return TopicModeler()

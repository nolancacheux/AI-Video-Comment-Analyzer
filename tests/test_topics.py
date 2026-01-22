"""
Tests for topic modeling service.
"""

import pytest

from api.services.topics import (
    TopicModeler,
    TopicResult,
    extract_keywords_simple,
    get_topic_modeler,
)


class TestExtractKeywordsSimple:
    """Tests for simple keyword extraction."""

    def test_extract_keywords_basic(self):
        """Test basic keyword extraction."""
        texts = [
            "Python programming tutorial",
            "Learn Python basics",
            "Python code examples",
        ]
        keywords = extract_keywords_simple(texts, top_n=3)
        assert "python" in keywords
        assert len(keywords) <= 3

    def test_extract_keywords_filters_stopwords(self):
        """Test that stopwords are filtered."""
        texts = ["The quick brown fox", "A very nice day"]
        keywords = extract_keywords_simple(texts, top_n=10)
        # Common stopwords should not appear
        assert "the" not in keywords
        assert "very" not in keywords

    def test_extract_keywords_empty_input(self):
        """Test keyword extraction with empty input."""
        keywords = extract_keywords_simple([], top_n=5)
        assert keywords == []

    def test_extract_keywords_short_words_filtered(self):
        """Test that words shorter than 3 chars are filtered."""
        texts = ["I am ok", "It is an"]
        keywords = extract_keywords_simple(texts, top_n=5)
        # Short words should not appear
        assert "am" not in keywords
        assert "ok" not in keywords
        assert "is" not in keywords

    def test_extract_keywords_top_n_limit(self):
        """Test that top_n limits results."""
        texts = ["word1 word2 word3 word4 word5 word6 word7"]
        keywords = extract_keywords_simple(texts, top_n=3)
        assert len(keywords) <= 3

    def test_extract_keywords_frequency_order(self):
        """Test that keywords are ordered by frequency."""
        texts = [
            "python python python",
            "java java",
            "rust",
        ]
        keywords = extract_keywords_simple(texts, top_n=3)
        assert keywords[0] == "python"

    def test_extract_keywords_french_stopwords(self):
        """Test that French stopwords are filtered."""
        texts = ["Le chat est sur la table", "Une voiture dans la rue"]
        keywords = extract_keywords_simple(texts, top_n=10)
        assert "est" not in keywords
        assert "une" not in keywords
        assert "dans" not in keywords


class TestTopicModeler:
    """Tests for TopicModeler class."""

    @pytest.fixture
    def modeler(self):
        """Get TopicModeler instance."""
        return TopicModeler()

    def test_modeler_singleton(self):
        """Test that get_topic_modeler returns singleton."""
        m1 = get_topic_modeler()
        m2 = get_topic_modeler()
        assert m1 is m2

    def test_modeler_initialization(self, modeler):
        """Test modeler initialization."""
        assert modeler._embedding_model_name == "all-MiniLM-L6-v2"
        assert modeler._embedding_model is None
        assert modeler._topic_model is None

    def test_extract_topics_too_few_texts(self, modeler):
        """Test topic extraction with too few texts."""
        texts = ["one", "two"]
        topics = modeler.extract_topics(texts, min_topic_size=3)
        assert topics == []

    def test_extract_topics_with_engagement(self, modeler):
        """Test topic extraction with engagement scores."""
        texts = [
            "Python tutorial basics",
            "Python programming examples",
            "Python code snippets",
            "JavaScript web tutorial",
            "JavaScript framework guide",
            "JavaScript examples",
        ]
        engagement = [100, 50, 25, 10, 5, 2]
        topics = modeler.extract_topics(texts, engagement_scores=engagement)

        assert isinstance(topics, list)
        for topic in topics:
            assert isinstance(topic, TopicResult)

    def test_extract_topics_without_engagement(self, modeler):
        """Test topic extraction without engagement scores."""
        texts = [
            "Machine learning basics",
            "Machine learning tutorial",
            "Machine learning examples",
        ]
        topics = modeler.extract_topics(texts)

        assert isinstance(topics, list)

    def test_extract_topics_max_topics_limit(self, modeler):
        """Test that max_topics limits results."""
        texts = [f"topic number {i} content here" for i in range(50)]
        topics = modeler.extract_topics(texts, max_topics=5)
        assert len(topics) <= 5

    def test_embedding_model_lazy_loading(self, modeler):
        """Test that embedding model is lazy loaded."""
        # Initially None
        assert modeler._embedding_model is None

        # Access triggers loading
        _ = modeler.embedding_model

        # Now should be loaded
        assert modeler._embedding_model is not None

    def test_extract_topics_with_sentiments(self, modeler):
        """Test topic extraction with sentiment labels."""
        texts = [
            "Machine learning is revolutionizing AI",
            "Deep learning neural networks",
            "AI machine learning algorithms",
            "Web development with React",
            "Frontend JavaScript frameworks",
            "React web application development",
        ]
        sentiments = ["positive", "positive", "neutral", "positive", "neutral", "positive"]
        topics = modeler.extract_topics(texts, sentiments=sentiments, max_topics=5)

        assert isinstance(topics, list)
        for topic in topics:
            assert isinstance(topic, TopicResult)
            assert hasattr(topic, "sentiment_breakdown")


class TestTopicResult:
    """Tests for TopicResult dataclass."""

    def test_topic_result_creation(self):
        """Test TopicResult creation."""
        result = TopicResult(
            topic_id=1,
            name="Python",
            keywords=["python", "programming", "code"],
            mention_count=15,
            total_engagement=250,
            comment_indices=[0, 3, 5, 7],
        )
        assert result.topic_id == 1
        assert result.name == "Python"
        assert result.keywords == ["python", "programming", "code"]
        assert result.mention_count == 15
        assert result.total_engagement == 250
        assert result.comment_indices == [0, 3, 5, 7]

    def test_topic_result_default_indices(self):
        """Test TopicResult default comment_indices."""
        result = TopicResult(
            topic_id=1,
            name="Test",
            keywords=[],
            mention_count=0,
            total_engagement=0,
        )
        assert result.comment_indices == []

    def test_topic_result_sentiment_breakdown(self):
        """Test TopicResult sentiment_breakdown field."""
        result = TopicResult(
            topic_id=1,
            name="Test",
            keywords=["test"],
            mention_count=10,
            total_engagement=100,
            sentiment_breakdown={"positive": 5, "negative": 3, "neutral": 2},
        )
        assert result.sentiment_breakdown["positive"] == 5
        assert result.sentiment_breakdown["negative"] == 3
        assert result.sentiment_breakdown["neutral"] == 2

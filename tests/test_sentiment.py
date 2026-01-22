"""
Tests for sentiment analysis service.
"""

import pytest

from api.services.sentiment import (
    BatchProgress,
    SentimentAnalyzer,
    SentimentCategory,
    SentimentResult,
    get_sentiment_analyzer,
    is_suggestion,
)


class TestSuggestionDetection:
    """Tests for suggestion pattern detection."""

    def test_is_suggestion_should_pattern(self):
        """Test suggestion detection with 'should' pattern."""
        assert is_suggestion("You should try adding more examples")
        assert is_suggestion("You could try using a different approach")

    def test_is_suggestion_please_pattern(self):
        """Test suggestion detection with 'please' pattern."""
        assert is_suggestion("Please add more tutorials")
        assert is_suggestion("Pls make a video about Python")

    def test_is_suggestion_would_be_nice_pattern(self):
        """Test suggestion detection with 'would be nice' pattern."""
        assert is_suggestion("It would be nice if you added subtitles")
        assert is_suggestion("Would be great to see more content")

    def test_is_suggestion_wish_pattern(self):
        """Test suggestion detection with 'wish/hope' pattern."""
        assert is_suggestion("I wish you would cover this topic")
        assert is_suggestion("I hope you can make a follow-up")
        assert is_suggestion("I suggest adding timestamps")

    def test_is_suggestion_can_you_pattern(self):
        """Test suggestion detection with 'can you' pattern."""
        assert is_suggestion("Can you please add timestamps?")
        assert is_suggestion("Could you make a video about React?")

    def test_is_suggestion_next_video_pattern(self):
        """Test suggestion detection with 'next video' pattern."""
        assert is_suggestion("Next video should be about machine learning")
        assert is_suggestion("For next time, consider adding more examples")

    def test_is_suggestion_feature_request_pattern(self):
        """Test suggestion detection with 'feature request' pattern."""
        assert is_suggestion("Feature request: add dark mode")
        assert is_suggestion("Here's a suggestion for improvement")

    def test_is_suggestion_french_patterns(self):
        """Test suggestion detection with French patterns."""
        assert is_suggestion("Pourriez-vous faire une video sur Python?")
        assert is_suggestion("Ce serait bien d'avoir plus d'exemples")
        # Note: "Je suggere" with accent may not match the pattern "je suggere"
        assert is_suggestion("Je propose d'ajouter des sous-titres")

    def test_is_suggestion_negative_cases(self):
        """Test that non-suggestions return False."""
        assert not is_suggestion("Great video!")
        assert not is_suggestion("I love this content")
        assert not is_suggestion("This is terrible")
        assert not is_suggestion("Just a random comment")

    def test_is_suggestion_case_insensitive(self):
        """Test that suggestion detection is case insensitive."""
        assert is_suggestion("YOU SHOULD TRY THIS")
        assert is_suggestion("PLEASE ADD MORE")


class TestSentimentAnalyzer:
    """Tests for SentimentAnalyzer class."""

    @pytest.fixture
    def analyzer(self):
        """Get SentimentAnalyzer instance."""
        return SentimentAnalyzer()

    def test_analyzer_singleton(self):
        """Test that get_sentiment_analyzer returns singleton."""
        a1 = get_sentiment_analyzer()
        a2 = get_sentiment_analyzer()
        assert a1 is a2

    def test_analyze_single_returns_result(self, analyzer):
        """Test that analyze_single returns SentimentResult."""
        result = analyzer.analyze_single("Great video!")
        assert isinstance(result, SentimentResult)
        assert result.category in SentimentCategory
        assert 0 <= result.score <= 1

    def test_analyze_single_suggestion(self, analyzer):
        """Test that suggestions are detected first."""
        result = analyzer.analyze_single("You should add more tutorials")
        assert result.category == SentimentCategory.SUGGESTION
        assert result.is_suggestion is True

    def test_analyze_single_positive(self, analyzer):
        """Test positive sentiment detection."""
        result = analyzer.analyze_single("I love this amazing content!")
        assert result.category == SentimentCategory.POSITIVE
        assert result.is_suggestion is False

    def test_analyze_single_negative(self, analyzer):
        """Test negative sentiment detection."""
        result = analyzer.analyze_single("This is terrible and boring")
        assert result.category == SentimentCategory.NEGATIVE

    def test_analyze_batch(self, analyzer):
        """Test batch analysis."""
        texts = ["Great!", "Terrible!", "Neutral comment"]
        results = analyzer.analyze_batch(texts)
        assert len(results) == 3
        assert all(isinstance(r, SentimentResult) for r in results)

    def test_analyze_batch_empty(self, analyzer):
        """Test batch analysis with empty list."""
        results = analyzer.analyze_batch([])
        assert results == []

    def test_analyze_batch_with_progress(self, analyzer):
        """Test batch analysis with progress reporting."""
        texts = ["Comment 1", "Comment 2", "Comment 3"]
        results = list(analyzer.analyze_batch_with_progress(texts))
        assert len(results) == 3
        for result, progress in results:
            assert isinstance(result, SentimentResult)
            assert isinstance(progress, BatchProgress)
            assert progress.total == 3

    def test_analyze_batch_with_progress_tracking(self, analyzer):
        """Test that progress is tracked correctly."""
        texts = ["A", "B", "C", "D", "E"]
        results = list(analyzer.analyze_batch_with_progress(texts, batch_size=2))

        # Check progress increments
        processed_counts = [p.processed for _, p in results]
        assert processed_counts == [1, 2, 3, 4, 5]

    def test_analyze_batch_with_custom_batch_size(self, analyzer):
        """Test batch analysis with custom batch size."""
        texts = ["A"] * 10
        results = list(analyzer.analyze_batch_with_progress(texts, batch_size=5))
        assert len(results) == 10

    def test_device_property(self, analyzer):
        """Test device property returns valid device."""
        device = analyzer.device
        assert device is not None
        assert device.type in ["cpu", "cuda"]

    def test_model_property(self, analyzer):
        """Test model property loads model."""
        model = analyzer.model
        assert model is not None

    def test_tokenizer_property(self, analyzer):
        """Test tokenizer property loads tokenizer."""
        tokenizer = analyzer.tokenizer
        assert tokenizer is not None

    def test_ml_truncates_long_text(self, analyzer):
        """Test that ML handles long text."""
        long_text = "word " * 1000
        result = analyzer.analyze_single(long_text, max_length=512)
        assert result is not None


class TestSentimentResult:
    """Tests for SentimentResult dataclass."""

    def test_sentiment_result_creation(self):
        """Test SentimentResult creation."""
        result = SentimentResult(
            category=SentimentCategory.POSITIVE,
            score=0.95,
            is_suggestion=False,
        )
        assert result.category == SentimentCategory.POSITIVE
        assert result.score == 0.95
        assert result.is_suggestion is False

    def test_sentiment_result_default_suggestion(self):
        """Test SentimentResult default is_suggestion."""
        result = SentimentResult(
            category=SentimentCategory.NEUTRAL,
            score=0.5,
        )
        assert result.is_suggestion is False


class TestBatchProgress:
    """Tests for BatchProgress dataclass."""

    def test_batch_progress_creation(self):
        """Test BatchProgress creation."""
        progress = BatchProgress(
            batch_num=1,
            total_batches=5,
            processed=32,
            total=160,
            batch_time_ms=150.5,
            tokens_in_batch=512,
        )
        assert progress.batch_num == 1
        assert progress.total_batches == 5
        assert progress.processed == 32
        assert progress.total == 160
        assert progress.batch_time_ms == 150.5
        assert progress.tokens_in_batch == 512


class TestSentimentCategory:
    """Tests for SentimentCategory enum."""

    def test_sentiment_category_values(self):
        """Test SentimentCategory enum values."""
        assert SentimentCategory.POSITIVE.value == "positive"
        assert SentimentCategory.NEGATIVE.value == "negative"
        assert SentimentCategory.NEUTRAL.value == "neutral"
        assert SentimentCategory.SUGGESTION.value == "suggestion"

    def test_sentiment_category_str(self):
        """Test SentimentCategory is string enum."""
        assert isinstance(SentimentCategory.POSITIVE, str)
        assert SentimentCategory.POSITIVE.value == "positive"

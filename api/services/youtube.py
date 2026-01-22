import json
import logging
import re
import subprocess
from dataclasses import dataclass
from datetime import datetime

from api.config import settings

logger = logging.getLogger(__name__)


@dataclass
class VideoMetadata:
    id: str
    title: str
    channel_id: str
    channel_title: str
    description: str
    thumbnail_url: str
    published_at: datetime | None


@dataclass
class CommentData:
    id: str
    author_name: str
    author_profile_image_url: str
    text: str
    like_count: int
    published_at: datetime | None
    parent_id: str | None = None


@dataclass
class SearchResultData:
    id: str
    title: str
    channel: str
    thumbnail: str
    duration: str | None
    view_count: int | None
    published_at: str | None = None
    description: str | None = None


class YouTubeExtractionError(Exception):
    pass


class CommentsDisabledError(YouTubeExtractionError):
    pass


class VideoNotFoundError(YouTubeExtractionError):
    pass


class YouTubeExtractor:
    YOUTUBE_URL_PATTERNS = [
        r"(?:https?://)?(?:www\.)?youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})",
        r"(?:https?://)?(?:www\.)?youtube\.com/shorts/([a-zA-Z0-9_-]{11})",
        r"(?:https?://)?youtu\.be/([a-zA-Z0-9_-]{11})",
        r"(?:https?://)?(?:www\.)?youtube\.com/embed/([a-zA-Z0-9_-]{11})",
    ]

    @classmethod
    def extract_video_id(cls, url: str) -> str | None:
        for pattern in cls.YOUTUBE_URL_PATTERNS:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    @classmethod
    def is_valid_youtube_url(cls, url: str) -> bool:
        return cls.extract_video_id(url) is not None

    @staticmethod
    def _run_yt_dlp(args: list[str], timeout: int | float) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["yt-dlp", *args],
            capture_output=True,
            text=True,
            timeout=timeout,
        )

    @staticmethod
    def _parse_upload_date(upload_date: str | None) -> datetime | None:
        if not upload_date:
            return None
        try:
            return datetime.strptime(upload_date, "%Y%m%d")
        except ValueError:
            return None

    @staticmethod
    def _parse_comment_timestamp(timestamp: int | float | None) -> datetime | None:
        if not timestamp:
            return None
        try:
            return datetime.fromtimestamp(timestamp)
        except (ValueError, OSError):
            return None

    @staticmethod
    def _format_duration(duration_secs: int | float | None) -> str | None:
        if not duration_secs:
            return None
        minutes, seconds = divmod(int(duration_secs), 60)
        hours, minutes = divmod(minutes, 60)
        if hours > 0:
            return f"{hours}:{minutes:02d}:{seconds:02d}"
        return f"{minutes}:{seconds:02d}"

    def _get_video_id(self, url: str) -> str:
        video_id = self.extract_video_id(url)
        if not video_id:
            raise VideoNotFoundError("Invalid YouTube URL")
        return video_id

    def get_video_metadata(self, url: str) -> VideoMetadata:
        video_id = self._get_video_id(url)

        logger.info(f"[YouTube] Fetching metadata for video: {video_id}")
        try:
            result = self._run_yt_dlp(
                [
                    "--dump-json",
                    "--no-download",
                    "--no-warnings",
                    url,
                ],
                timeout=settings.YOUTUBE_METADATA_TIMEOUT,
            )

            if result.returncode != 0:
                stderr = result.stderr
                if "Video unavailable" in stderr or "Private video" in stderr:
                    raise VideoNotFoundError("Video is unavailable or private")
                raise YouTubeExtractionError(f"Failed to extract video metadata: {stderr}")

            data = json.loads(result.stdout)

            published_at = self._parse_upload_date(data.get("upload_date"))

            metadata = VideoMetadata(
                id=video_id,
                title=data.get("title", "Unknown"),
                channel_id=data.get("channel_id", ""),
                channel_title=data.get("channel", data.get("uploader", "Unknown")),
                description=data.get("description", ""),
                thumbnail_url=data.get(
                    "thumbnail", f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg"
                ),
                published_at=published_at,
            )
            logger.info(f"[YouTube] Got metadata: '{metadata.title}' by {metadata.channel_title}")
            return metadata

        except subprocess.TimeoutExpired:
            raise YouTubeExtractionError("Timeout while fetching video metadata")
        except json.JSONDecodeError:
            raise YouTubeExtractionError("Failed to parse video metadata")

    def get_comments(self, url: str, max_comments: int | None = None) -> list[CommentData]:
        if max_comments is None:
            max_comments = settings.YOUTUBE_MAX_COMMENTS
        video_id = self._get_video_id(url)

        logger.info(f"[YouTube] Extracting up to {max_comments} comments for video: {video_id}")
        try:
            result = self._run_yt_dlp(
                [
                    "--skip-download",
                    "--write-comments",
                    "--no-warnings",
                    "--extractor-args",
                    f"youtube:max_comments={max_comments},all,100,100",
                    "--dump-json",
                    url,
                ],
                timeout=settings.YOUTUBE_COMMENTS_TIMEOUT,
            )

            if result.returncode != 0:
                if "comments are disabled" in result.stderr.lower():
                    raise CommentsDisabledError("Comments are disabled for this video")
                raise YouTubeExtractionError(f"Failed to extract comments: {result.stderr}")

            data = json.loads(result.stdout)
            raw_comments = data.get("comments", [])

            if not raw_comments:
                return []

            comments = []
            for comment in raw_comments:
                parent_id = comment.get("parent")
                if parent_id == "root":
                    parent_id = None

                comments.append(
                    CommentData(
                        id=comment.get("id", ""),
                        author_name=comment.get("author", "Unknown"),
                        author_profile_image_url=comment.get("author_thumbnail", ""),
                        text=comment.get("text", ""),
                        like_count=comment.get("like_count", 0) or 0,
                        published_at=self._parse_comment_timestamp(comment.get("timestamp")),
                        parent_id=parent_id,
                    )
                )

            logger.info(f"[YouTube] Extracted {len(comments)} comments")
            return comments

        except subprocess.TimeoutExpired:
            raise YouTubeExtractionError("Timeout while fetching comments")
        except json.JSONDecodeError:
            raise YouTubeExtractionError("Failed to parse comments data")

    def search_videos(self, query: str, max_results: int | None = None) -> list[SearchResultData]:
        """Search YouTube videos using yt-dlp's ytsearch feature."""
        if max_results is None:
            max_results = settings.YOUTUBE_SEARCH_MAX_RESULTS
        if not query.strip():
            return []

        logger.info(f"[YouTube] Searching for: '{query}' (max {max_results} results)")
        try:
            # Use --flat-playlist for fast search (no full metadata download)
            result = self._run_yt_dlp(
                [
                    f"ytsearch{max_results}:{query}",
                    "--dump-json",
                    "--no-download",
                    "--no-warnings",
                    "--flat-playlist",
                ],
                timeout=settings.YOUTUBE_SEARCH_TIMEOUT,
            )

            if result.returncode != 0 and not result.stdout:
                raise YouTubeExtractionError(f"Search failed: {result.stderr}")

            results = []
            for line in result.stdout.strip().split("\n"):
                if not line:
                    continue
                try:
                    data = json.loads(line)
                    video_id = data.get("id", "")

                    # Skip if no video ID
                    if not video_id:
                        continue

                    # Format duration (flat-playlist gives duration in seconds)
                    duration_str = self._format_duration(data.get("duration"))

                    results.append(
                        SearchResultData(
                            id=video_id,
                            title=data.get("title", "Unknown"),
                            channel=data.get("channel", data.get("uploader", "Unknown")),
                            thumbnail=f"https://i.ytimg.com/vi/{video_id}/mqdefault.jpg",
                            duration=duration_str,
                            view_count=data.get("view_count"),
                            published_at=None,  # Not available in flat mode
                            description=None,  # Not available in flat mode
                        )
                    )
                except json.JSONDecodeError:
                    continue

            logger.info(f"[YouTube] Search found {len(results)} results")
            return results

        except subprocess.TimeoutExpired:
            logger.warning(f"[YouTube] Search timed out after {settings.YOUTUBE_SEARCH_TIMEOUT}s")
            raise YouTubeExtractionError("Timeout while searching videos")

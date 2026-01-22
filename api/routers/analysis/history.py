from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.config import settings
from api.db import Analysis, Topic, TopicComment, get_db
from api.models import AnalysisHistoryItem

router = APIRouter()


@router.get("/history", response_model=list[AnalysisHistoryItem])
async def get_analysis_history(
    limit: int | None = None,
    db: Session = Depends(get_db),
) -> list[AnalysisHistoryItem]:
    if limit is None:
        limit = settings.HISTORY_LIMIT
    analyses = db.query(Analysis).order_by(Analysis.analyzed_at.desc()).limit(limit).all()

    return [
        AnalysisHistoryItem(
            id=a.id,
            video_id=a.video.id,
            video_title=a.video.title,
            video_thumbnail=a.video.thumbnail_url,
            total_comments=a.total_comments,
            analyzed_at=a.analyzed_at,
        )
        for a in analyses
    ]


@router.delete("/history/{analysis_id}")
async def delete_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
) -> dict[str, int | str]:
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    topics = db.query(Topic).filter(Topic.analysis_id == analysis_id).all()
    for topic in topics:
        db.query(TopicComment).filter(TopicComment.topic_id == topic.id).delete()
    db.query(Topic).filter(Topic.analysis_id == analysis_id).delete()

    db.delete(analysis)
    db.commit()

    return {"status": "deleted", "id": analysis_id}

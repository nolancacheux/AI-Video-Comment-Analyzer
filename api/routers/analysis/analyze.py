from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from api.db import get_db
from api.models import AnalyzeRequest

from .pipeline import run_analysis

router = APIRouter()


@router.post("/analyze")
async def analyze_video(
    request: AnalyzeRequest,
    db: Session = Depends(get_db),
) -> StreamingResponse:
    return StreamingResponse(
        run_analysis(request.url, db),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )

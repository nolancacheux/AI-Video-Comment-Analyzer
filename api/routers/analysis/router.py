from fastapi import APIRouter

from .analyze import router as analyze_router
from .comments import router as comments_router
from .history import router as history_router
from .results import router as results_router
from .search import router as search_router

router = APIRouter(prefix="/api/analysis", tags=["analysis"])
router.include_router(analyze_router)
router.include_router(results_router)
router.include_router(history_router)
router.include_router(comments_router)
router.include_router(search_router)

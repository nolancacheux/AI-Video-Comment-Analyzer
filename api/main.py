from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="VidInsight API",
    description="YouTube comment analysis API that extracts, categorizes, and prioritizes audience feedback",
    version="0.1.0",
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "VidInsight API", "version": "0.1.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

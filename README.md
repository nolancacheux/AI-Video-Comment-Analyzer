# AI-Video-Comment-Analyzer

AI-powered YouTube comment analysis tool with sentiment detection, topic modeling, and AI-generated summaries.

## Features

- **Comment Extraction**: Fetch comments from any YouTube video using yt-dlp
- **Sentiment Analysis**: BERT-powered multilingual sentiment classification (positive/negative/neutral/suggestion)
- **Topic Modeling**: BERTopic clustering to identify key discussion themes
- **AI Summaries**: Local LLM-powered summaries via Ollama (llama3.2:3b)
- **Interactive Dashboard**: Real-time analysis progress with topic ranking sidebar
- **Topic Slide-Over**: Click any topic to see all related comments

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- Python 3.11+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- [Ollama](https://ollama.ai) (optional, for AI summaries)

### Frontend Setup

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend Setup

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies and create venv
uv sync

# Run API server
uv run uvicorn api.main:app --reload --port 8000
```

API available at [http://localhost:8000](http://localhost:8000)

### Ollama Setup (Optional)

For AI-generated summaries of comment sentiment:

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull the model
ollama pull llama3.2:3b

# Start Ollama server (if not running)
ollama serve
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: FastAPI, Python 3.11+, yt-dlp
- **Database**: SQLite with SQLAlchemy
- **AI/ML**:
  - `nlptown/bert-base-multilingual-uncased-sentiment` (sentiment analysis)
  - BERTopic (topic modeling)
  - Ollama with llama3.2:3b (AI summaries)

## Project Structure

```
AI-Video-Comment-Analyzer/
├── src/                    # Next.js frontend
│   ├── components/         # React components
│   │   ├── results/        # Topic ranking, sentiment summaries
│   │   └── ui/             # shadcn components
│   ├── hooks/              # useAnalysis hook
│   └── types/              # TypeScript interfaces
├── api/                    # FastAPI backend
│   ├── services/           # ML services
│   │   ├── summarizer.py   # Ollama LLM integration
│   │   ├── sentiment.py    # BERT sentiment
│   │   └── topics.py       # Topic modeling
│   ├── routers/            # API endpoints
│   └── db/                 # SQLAlchemy models
└── tests/                  # pytest tests
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analysis/analyze` | Start analysis (SSE stream) |
| GET | `/api/analysis/result/{id}` | Get analysis results |
| GET | `/api/analysis/history` | List past analyses |
| DELETE | `/api/analysis/history/{id}` | Delete an analysis |
| GET | `/api/analysis/video/{id}/comments` | Get comments for a video |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Ollama (AI Summaries)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_ENABLED=true

# Hugging Face (optional, for faster inference)
HF_TOKEN=your_token_here
HF_ENABLED=true
```

## Development

### Running Tests

```bash
# Run all tests
uv run pytest tests/ -v

# Run with coverage report
uv run pytest tests/ -v --cov=api --cov-report=term-missing
```

### Code Quality

```bash
# Lint check
uv run ruff check api/ tests/

# Auto-fix lint issues
uv run ruff check api/ tests/ --fix

# Format code
uv run ruff format api/ tests/
```

### CI Pipeline

GitHub Actions runs on every push/PR:
- **Lint**: Ruff check + format verification
- **Test**: pytest with 75% coverage threshold

## License

MIT

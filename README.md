# VidInsight

YouTube comment analysis tool that extracts, categorizes, and prioritizes audience feedback.

## Features

- Extract comments from YouTube videos
- Categorize comments using AI-powered topic modeling
- Analyze sentiment distribution
- Identify key themes and feedback patterns
- Prioritize actionable insights

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- Python 3.11+

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
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run API server
pnpm api
```

API available at [http://localhost:8000](http://localhost:8000)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: FastAPI, Python 3.11+
- **Database**: SQLite with SQLAlchemy
- **AI/ML**: BERTopic, Transformers

## Project Structure

```
vidinsight/
├── src/           # Next.js frontend
├── api/           # FastAPI backend
├── tests/         # Backend tests
└── ...
```

## License

MIT

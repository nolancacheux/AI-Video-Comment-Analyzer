# VidInsight Development Instructions

## Core Rules

- Small, clean commits with best practices
- NEVER mention Claude in commits, branches, or PRs
- Always create a Claude.md file (in .gitignore) for each project
- Update INSTRUCTIONS.md and Claude.md before each commit
- Always keep code ultra clean

## General Preferences

- Never use emojis or smileys in any output
- Always communicate in English

## Project Overview
VidInsight is a YouTube comment analysis tool that extracts, categorizes, and prioritizes audience feedback using AI-powered analysis.

## Tech Stack
- **Frontend**: Next.js 15 with React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui
- **Backend**: FastAPI with Python 3.11+
- **Database**: SQLite with SQLAlchemy
- **AI/ML**: BERTopic for topic modeling, Transformers for sentiment analysis

## Development Setup

### Prerequisites
- Node.js 20+
- pnpm
- Python 3.11+
- uv or pip for Python package management

### Frontend Development
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

### Backend Development
```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run API server
pnpm api
# or
uvicorn api.main:app --reload
```

## Code Standards

### TypeScript/React
- Use functional components with TypeScript
- Prefer named exports
- Use the `cn()` utility for conditional class names
- Follow shadcn/ui patterns for components

### Python
- Use type hints
- Follow PEP 8 style guide
- Use async/await for I/O operations
- Use Pydantic models for request/response validation

## Project Structure
- `src/` - Next.js frontend source
- `api/` - FastAPI backend
- `tests/` - Backend tests
- `src/db/` - SQLite database location

## Environment Variables
Create a `.env.local` file for frontend and `.env` for backend configuration.

Required variables will be documented as features are implemented.

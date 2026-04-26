# AI Inbox Assistant

An AI-powered email management tool that helps you process, summarise, and act on your inbox using Claude.

## Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Backend  | Python 3.12 + FastAPI   |
| AI       | Anthropic Claude API    |

## Project Structure

```
AI-Inbox-Assistant/
├── frontend/          # Next.js application
└── backend/           # FastAPI application
    ├── app/
    │   └── routers/   # Route handlers
    ├── main.py        # FastAPI entry point
    └── requirements.txt
```

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # fill in your API keys
uvicorn main:app --reload
```

API runs at `http://localhost:8000` — docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local      # set NEXT_PUBLIC_API_URL
npm run dev
```

App runs at `http://localhost:3000`.

## Environment Variables

### Backend (`backend/.env`)

| Variable              | Description                         |
|-----------------------|-------------------------------------|
| `ANTHROPIC_API_KEY`   | Your Anthropic API key              |
| `GMAIL_CLIENT_ID`     | Google OAuth client ID              |
| `GMAIL_CLIENT_SECRET` | Google OAuth client secret          |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL                  |

### Frontend (`frontend/.env.local`)

| Variable              | Description               |
|-----------------------|---------------------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL          |

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request

## License

MIT

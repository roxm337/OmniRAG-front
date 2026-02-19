# OmniRAG Front

Next.js frontend platform for OmniRAG backend.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Fetch API client
- Responsive custom UI

## Features

- Backend URL switcher (`http://localhost:8000` by default)
- Health monitoring
- Admin login
- Route protection proxy (all dashboard routes require login)
- Bot create/update/delete and active bot selection
- Ingest text
- Ingest file (TXT/PDF)
- Ingest DB schema allowlist per bot
- Vector retrieval explorer
- RAG chat with provider override (`deepseek` / `groq`) per bot
- DB Mode B chat (SQL + explanation + confidence + rows + audit) per bot
- Source citation rendering
- Bot history and platform logs pages
- Activity timeline with local persistence

## Run

```bash
cd OmniRAG-front
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

You will be redirected to `/login` until authenticated.

## Environment

`.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Production

```bash
npm run build
npm run start
```

## Requirements

- Node.js >= 20.9.0
# OmniRAG-front

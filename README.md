# Stonethrow

Stonethrow organizes, prioritizes, and helsp you act on saved content by allowing you to set a "focus", and organize your links by what matters most. 

## Core Concepts

- **Pebbles** — the atomic unit of saved content. A pebble can be a URL, YouTube video, article, or note. Stonethrow extracts metadata, transcripts, and page text automatically.
- **Focus** — a statement of what you're currently trying to accomplish. The AI uses your focus to score and rank which pebbles are most relevant to you right now.
- **Scoring** — pebbles are scored in the background using Claude (for relevance) and Voyage AI (for semantic similarity). The dashboard surfaces your highest-signal content first.

## Stack

- **Framework**: Next.js (App Router)
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security)
- **AI**: Anthropic Claude (relevance scoring, focus validation, coach hints)
- **Embeddings**: Voyage AI (semantic similarity ranking)
- **Hosting**: Vercel
- **Analytics**: Vercel Analytics

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
CLAUDE_API_KEY=
VOYAGE_API_KEY=
```

- **Supabase**: create a project at [supabase.com](https://supabase.com) and grab the project URL and anon key
- **Claude**: get an API key from [console.anthropic.com](https://console.anthropic.com)
- **Voyage AI**: get an API key from [voyageai.com](https://www.voyageai.com)

### 3. Apply database migrations

```bash
npx supabase db push
```

Or apply migrations manually from `supabase/migrations/` in order.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app routes traffic based on subdomain: `app.localhost` (or `app.stonethrow.io` in production) serves the dashboard; the root domain serves the marketing page.

## Deployment

Deploy to Vercel. Set the same environment variables from `.env.local` in your Vercel project settings.

Make sure your Supabase project has the production URL added to the allowed redirect URLs for auth.

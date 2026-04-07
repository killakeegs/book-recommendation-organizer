@AGENTS.md

# Book Recommendation Organizer

A web app where friends and family submit book recommendations. Submissions are auto-enriched with author, cover, and summary via the Google Books API. A public page shows all recommendations. Keegan receives a daily 8 PM PST email digest of new submissions.

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| Book data | Google Books API (free, no key required) |
| Email | Resend |
| Hosting | Vercel (Hobby — free) |
| Cron | Vercel Cron Jobs |

## Key Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # Lint with ESLint
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in values:

```
NEXT_PUBLIC_SUPABASE_URL=         # From Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # From Supabase project settings
RESEND_API_KEY=                   # From resend.com dashboard
CRON_SECRET=                      # Any random string (e.g. openssl rand -hex 32)
DIGEST_EMAIL=keeganwarrington@gmail.com
```

## Database Schema (Supabase)

Run this SQL in your Supabase project's SQL editor:

```sql
create table books (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  author      text,
  cover_url   text,
  summary     text,
  amazon_url  text,
  recommender text not null,
  note        text,
  created_at  timestamptz default now()
);
```

## API Routes

- `GET  /api/books/search?q=QUERY` — Autocomplete: returns 5 book suggestions from Google Books
- `GET  /api/books`                — Fetch all books (newest first)
- `POST /api/books`                — Submit a new book recommendation
- `POST /api/digest`               — Triggered by Vercel Cron at 4:00 AM UTC (8 PM PST)

## Cron

`vercel.json` configures the daily digest at `0 4 * * *` (8 PM PST / 4 AM UTC).
To test manually:
```bash
curl -X POST https://your-site.vercel.app/api/digest \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Deployment

1. Create Supabase project → run SQL schema → copy URL + anon key
2. Create Resend account → get API key (free tier sends to verified email only)
3. Push to GitHub
4. Import repo on vercel.com → add all env vars → deploy
5. Confirm cron job appears in Vercel dashboard under "Cron Jobs"

## Code Conventions

- Tailwind 4: custom colors/fonts defined via `@theme inline` in `globals.css`, not `tailwind.config.ts`
- Add `'use client'` only to components that use state, effects, or browser APIs
- Interactive components: `BookForm.tsx`, `BookList.tsx`
- Static/server components: `BookCard.tsx`, `app/page.tsx`
- All DB access happens in API routes (server-side), never directly in client components

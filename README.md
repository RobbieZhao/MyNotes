# Interactive Document Builder

Compose interactive documents from blocks — text, datasets, charts, and data tables.

## Tech Stack

- Next.js App Router + TypeScript
- Material UI + MUI X Data Grid
- Supabase Auth + Postgres
- D3 for chart scales and transforms
- React Context for state

## Setup

1. Copy environment variables:

```bash
cp .env.local.example .env.local
```

2. Add your Supabase project URL and anon key to `.env.local`.

3. Run migrations against your Supabase project (via Supabase CLI or SQL editor):

- `supabase/migrations/001_documents.sql`
- `supabase/migrations/002_blocks.sql`
- `supabase/migrations/003_datasets.sql`

4. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000), sign up, and create a document.

## Features

- Supabase authentication with protected routes
- Document CRUD with sidebar navigation
- Block editor with live preview
- Block types: Text, Dataset, Country Selector, Line Chart, Pie Chart, Data Table
- CSV dataset import
- Fractional block positioning with automatic reindex
- Page-local country filter state consumed by charts

## Block Positioning

Blocks use fractional positions (1000, 2000, 3000…). Insertions use `(left + right) / 2`. When positions become too dense, blocks are reindexed automatically.

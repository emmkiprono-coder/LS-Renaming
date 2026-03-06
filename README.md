# Voting Portal — Advocate Health Language Services

## Setup
1. Clone this repo
2. Copy `.env.example` to `.env` and fill in your Supabase credentials
3. `npm install`
4. `npm run dev`

## Deploy to Vercel
1. Push to GitHub
2. Import in Vercel → add env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`
3. Deploy

## Updating Finalists
Edit the `FINALISTS` array in `src/App.tsx` with the actual finalist names from the submissions phase.

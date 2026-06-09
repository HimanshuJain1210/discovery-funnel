# Product Discovery Funnel

A guided, AI-assisted workspace for continuous product discovery — and a tool that teaches the method as you use it.

**Flow:** Outcome → Mom Test interviews → pain points (signal vs noise) → opportunities → RICE-scored solutions + riskiest-assumption experiments.

**Features**
- Multi-project dashboard with per-stage progress
- AI steps on free Groq: Mom Test questions, pain-point extraction, opportunity clustering, experiment cards
- Opportunity Solution Tree visual
- Export to Markdown and PDF
- Public read-only share links
- Light / dark / system theme
- Magic-link auth, per-user data, autosave, multi-device sync

---

## Why your Groq key stays private

The key never reaches the browser. The frontend calls `/api/groq` (a Vercel serverless function); that function reads `GROQ_API_KEY` from a server-only env var. Nothing secret is in the repo or the shipped bundle.

The Supabase **anon key is public by design** — it's meant for browsers. Your data is protected by Row Level Security policies in `supabase_schema.sql`, not by hiding the key.

---

## 1 · Keys

**Groq** — console.groq.com → API Keys → Create.

**Supabase** — supabase.com → New project, then:
- SQL Editor → New query → paste all of `supabase_schema.sql` → Run. (Safe to re-run; it also upgrades a v1 database.)
- Settings → API → copy the **Project URL** and the **anon public** key.
- Authentication → Providers → ensure **Email** is on.

## 2 · GitHub (web upload, no git)

1. New repository → name it `discovery-funnel` → Create.
2. "uploading an existing file" → drag in everything **except** `node_modules` and `.env`.
3. Keep folders: `api/`, `src/`, plus `vercel.json`. Commit.

## 3 · Vercel

1. Add New → Project → import the repo. Framework: **Vite** (auto).
2. Environment Variables — add all three:

   | Name | Value | Notes |
   |------|-------|-------|
   | `GROQ_API_KEY` | Groq key | secret, server-only, NO `VITE_` prefix |
   | `VITE_SUPABASE_URL` | Supabase URL | public |
   | `VITE_SUPABASE_ANON_KEY` | Supabase anon key | public |

3. Deploy. `vercel.json` already routes all non-API paths to the SPA so deep links and `/share/:id` work.

## 4 · Point Supabase at your live URL

Supabase → Authentication → URL Configuration → set **Site URL** to your Vercel URL and add it to **Redirect URLs**. Otherwise magic-link login redirects to localhost.

## 5 · Use

Open the URL → Start a project → magic-link sign-in → build. Autosaves and syncs across devices. Toggle a project public to get a shareable read-only link.

---

## Updating

Edit a file on GitHub (pencil icon) and commit, or re-upload. Vercel redeploys on every commit.

## Cost

Free across the board: Groq free API, Supabase free project, Vercel hobby. PDF export library loads only when you click Export PDF, keeping the initial load light.

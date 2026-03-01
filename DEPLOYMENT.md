# Sensory Composer — Deployment Guide

This guide walks through deploying all three parts of the Sensory Composer stack:

| Platform | Service | What runs there |
|---|---|---|
| **Vercel** | Frontend | Next.js 14 app |
| **Render** | Backend | Laravel API + FastAPI + Rust DSP |
| **Supabase** | Database | PostgreSQL (replaces local DB) |

Complete each section in the order shown. Total time: approximately 45–60 minutes.

---

## Prerequisites

Before you begin, create free accounts at the following services:

- [vercel.com](https://vercel.com) — sign in with GitHub
- [render.com](https://render.com) — sign in with GitHub
- [supabase.com](https://supabase.com) — sign in with GitHub

Push the project to a **GitHub repository** first, as all three platforms deploy directly from GitHub.

```bash
cd sensory-composer
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/sensory-composer.git
git push -u origin main
```

---

## Part 1 — Supabase (Database)

Supabase provides a managed PostgreSQL database. Set this up first because Laravel and the other services need the connection string during deployment.

### Step 1.1 — Create a project

1. Go to [app.supabase.com](https://app.supabase.com) and click **New project**.
2. Enter a project name (e.g. `sensory-composer`), choose a region close to your users, and set a strong database password. Save this password somewhere safe — you will need it shortly.
3. Wait approximately two minutes for the project to provision.

### Step 1.2 — Run the database schema

1. In the Supabase dashboard, open **SQL Editor** in the left sidebar and click **New query**.
2. Copy the entire contents of `backend/database/migrations/supabase_init.sql` and paste it into the editor.
3. Click **Run**. You should see `Success. No rows returned`.

This creates the `scores` table, sets up Row Level Security so only the Laravel service can write to it, and adds an auto-updating `updated_at` trigger.

### Step 1.3 — Collect your connection details

Navigate to **Project Settings → Database** and copy the following values. You will paste them into Render in Part 2.

| Value | Where to find it |
|---|---|
| `DB_HOST` | Connection string → Host (format: `db.xxxx.supabase.co`) |
| `DB_PASSWORD` | The password you set in Step 1.1 |
| `SUPABASE_URL` | Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` key (keep secret) |

> **Important:** Use the **Session mode** connection pooler on port `5432` (not port `6543`) for Laravel. This is listed under **Connection pooling** in the Database settings.

---

## Part 2 — Render (Backend Services)

Render hosts three independent services from the same repository: the Laravel API, the Python FastAPI service, and the Rust DSP service.

### Step 2.1 — Connect your repository

1. Go to [dashboard.render.com](https://dashboard.render.com) and click **New → Blueprint**.
2. Connect your GitHub account if prompted, then select the `sensory-composer` repository.
3. Render will detect the `render.yaml` file at the project root and propose three services automatically: `sensory-composer-laravel`, `sensory-composer-fastapi`, and `sensory-composer-rust-dsp`. Click **Apply**.

### Step 2.2 — Set environment variables for Laravel

Once the blueprint is created, click on `sensory-composer-laravel` and open its **Environment** tab. Add the following variables using the values collected from Supabase:

| Key | Value |
|---|---|
| `DB_HOST` | `db.xxxxxxxxxxxxxxxxxxxx.supabase.co` |
| `DB_PASSWORD` | your Supabase database password |
| `DB_USERNAME` | `postgres` |
| `SUPABASE_URL` | `https://xxxxxxxxxxxxxxxxxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
| `FRONTEND_URL` | `https://your-project.vercel.app` *(set this after Part 3)* |
| `FASTAPI_URL` | `https://sensory-composer-fastapi.onrender.com` |
| `RUST_DSP_URL` | `https://sensory-composer-rust-dsp.onrender.com` |

The `APP_KEY` is generated automatically by `render.yaml` — you do not need to set it manually.

### Step 2.3 — Deploy

Click **Save changes** and Render will trigger an automatic deploy. The build runs `bash build.sh`, which installs Composer dependencies, generates the application key, runs migrations against Supabase, and caches the Laravel configuration. Watch the **Logs** tab and confirm you see `Build complete` with no errors.

After a successful deploy, Render shows a live URL such as `https://sensory-composer-laravel.onrender.com`. Note this URL — you need it for the Vercel environment variables.

### Step 2.4 — Verify the services

Test each service with a browser or `curl`:

```bash
curl https://sensory-composer-laravel.onrender.com/api/health
# Expected: {"status":"ok","service":"laravel"}

curl https://sensory-composer-fastapi.onrender.com/health
# Expected: {"status":"ok","service":"fastapi"}

curl https://sensory-composer-rust-dsp.onrender.com/health
# Expected: {"status":"ok","service":"rust-dsp"}
```

> **Note on Render free tier:** Free services spin down after 15 minutes of inactivity and take ~30 seconds to cold-start on the first request. This is normal. Upgrade to a paid plan to eliminate cold starts in production.

---

## Part 3 — Vercel (Frontend)

### Step 3.1 — Import the project

1. Go to [vercel.com/new](https://vercel.com/new) and click **Import Git Repository**.
2. Select your `sensory-composer` repository.
3. Vercel will read `vercel.json` from the project root and automatically set:
   - **Framework**: Next.js
   - **Build command**: `cd frontend && npm ci && npm run build`
   - **Output directory**: `frontend/.next`
   - **Root directory**: `.` (project root)

   Do not change these settings.

### Step 3.2 — Set environment variables

In the Vercel project settings (or during the import wizard), add the following environment variables:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://sensory-composer-laravel.onrender.com/api/v1` |
| `NEXT_PUBLIC_FASTAPI_URL` | `https://sensory-composer-fastapi.onrender.com` |
| `NEXT_PUBLIC_COUCH_URL` | `https://your-couchdb.onrender.com` *(if using CouchDB sync; omit otherwise)* |

Set all three variables for **Production**, **Preview**, and **Development** environments unless you want different values per environment.

### Step 3.3 — Deploy

Click **Deploy**. Vercel builds the Next.js app, runs `npm run build`, and publishes it to a CDN. Build time is typically 60–90 seconds. After a successful deploy you receive a URL such as `https://sensory-composer.vercel.app`.

### Step 3.4 — Update the Laravel CORS setting

Go back to Render → `sensory-composer-laravel` → **Environment** and update `FRONTEND_URL` to your actual Vercel URL:

```
FRONTEND_URL=https://sensory-composer.vercel.app
```

Render will automatically redeploy Laravel with the corrected CORS origin.

---

## Part 4 — Post-deployment checks

Run through this checklist after all three platforms are live:

**Frontend (Vercel)**
- Open `https://your-project.vercel.app` — the home page should load with the three feature cards.
- Navigate to **Audio Studio**, grant microphone permission, and confirm the canvas renders the FFT visualiser.
- Navigate to **Poetry Editor** and confirm the Markdown editor works with live preview.

**API (Render — Laravel)**
- Submit a score from the **Score Export** page and verify it appears in the Laravel Admin Dashboard at `https://sensory-composer-laravel.onrender.com/dashboard`.
- Check the Supabase **Table Editor → scores** to confirm the row was inserted.

**Microservices (Render — FastAPI + Rust)**
- In the Score Export page, upload an audio file. The analysis result should return within a few seconds (allow for cold-start on the first request).

**Database (Supabase)**
- Go to Supabase **Table Editor → scores** and confirm your test score row is present with correct `created_at` and `updated_at` timestamps.

---

## Environment variable summary

Use this table as a single-page reference when configuring each platform.

| Variable | Platform | Value source |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Vercel | Render → Laravel service URL + `/api/v1` |
| `NEXT_PUBLIC_FASTAPI_URL` | Vercel | Render → FastAPI service URL |
| `NEXT_PUBLIC_COUCH_URL` | Vercel | Render → CouchDB service URL |
| `DB_HOST` | Render (Laravel) | Supabase → Project Settings → Database |
| `DB_PASSWORD` | Render (Laravel) | Supabase → your chosen password |
| `SUPABASE_URL` | Render (Laravel) | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Render (Laravel) | Supabase → Project Settings → API |
| `FASTAPI_URL` | Render (Laravel) | Render → FastAPI service URL |
| `RUST_DSP_URL` | Render (Laravel) | Render → Rust DSP service URL |
| `FRONTEND_URL` | Render (Laravel) | Vercel → your deployment URL |
| `APP_KEY` | Render (Laravel) | Auto-generated by `render.yaml` |

---

## Troubleshooting

**Build fails on Render (Laravel) — "could not find driver pgsql"**
The Render PHP environment includes the `pgsql` extension. If you see this error it usually means `DB_CONNECTION` is not set. Confirm the environment variable is saved and redeploy.

**CORS errors in browser console**
Ensure `FRONTEND_URL` in the Laravel environment exactly matches your Vercel URL, including the `https://` prefix and without a trailing slash.

**FastAPI or Rust DSP returns 502 from Laravel**
These services take up to 30 seconds to cold-start on the free tier. Retry the request after a short wait. If the error persists, check the service logs in the Render dashboard.

**Supabase connection refused — SSL error**
Confirm `DB_SSLMODE=require` is set. Supabase requires TLS for all external connections.

**Next.js build error — "Module not found: pouchdb-browser"**
This is a server-side rendering conflict. Confirm `next.config.js` has `serverComponentsExternalPackages: ["pouchdb-browser", "sql.js"]` and that all PouchDB/IndexedDB code uses `"use client"` at the top of the file.

---

Generated via ChatGPT

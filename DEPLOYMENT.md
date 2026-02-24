# CaSiCaS — Railway Deployment Guide

## Architecture
- **Backend**: Django + Daphne (ASGI) — Railway service with PostgreSQL addon
- **Frontend**: Vite React — Railway static site or separate service

---

## Step 1: Push to GitHub

```bash
cd /home/mike/Desktop/casicas-application
git init
git add .
git commit -m "CaSiCaS Phase 2.5 — ready for deployment"
git remote add origin https://github.com/<your-username>/casicas-application.git
git push -u origin main
```

## Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app) → **New Project**
2. Choose **Deploy from GitHub repo** → select `casicas-application`

## Step 3: Backend Service

1. In Railway, click **Add Service** → **GitHub Repo**
2. Set **Root Directory** to `backend`
3. Add a **PostgreSQL** addon
4. Set these **environment variables**:

| Variable | Value |
|---|---|
| `SECRET_KEY` | Generate a random 50-char string |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `your-backend.up.railway.app` |
| `DATABASE_URL` | *(auto-set by PostgreSQL addon)* |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.up.railway.app` |
| `CSRF_TRUSTED_ORIGINS` | `https://your-frontend.up.railway.app` |

Railway will auto-detect the `Procfile` and run migrations + collectstatic on deploy.

## Step 4: Frontend Service

1. **Add Service** → **GitHub Repo** (same repo)
2. Set **Root Directory** to `frontend`
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npx serve dist -s -l $PORT`
5. Set env variable:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.up.railway.app` |

> **Note**: `VITE_API_URL` must be set at **build time** since Vite inlines env vars.

## Step 5: Seed Data

After deploy, open Railway backend shell:
```bash
python manage.py createsuperuser
python manage.py seed_data  # if you have the management command
```

## Required Backend Env Summary
```
SECRET_KEY=<random-string>
DEBUG=False
ALLOWED_HOSTS=<backend-domain>
DATABASE_URL=<auto>
CORS_ALLOWED_ORIGINS=https://<frontend-domain>
CSRF_TRUSTED_ORIGINS=https://<frontend-domain>
```

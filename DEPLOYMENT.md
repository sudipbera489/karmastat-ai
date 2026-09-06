# Vercel Deployment

Deploy this repository as two Vercel projects.

## Backend

1. Create a separate Vercel project from this repository for the backend.
2. Set the project root to the repository root.
3. Add these environment variables:
   - `DJANGO_SECRET_KEY`: a long random secret
   - `DJANGO_DEBUG`: `False`
   - `DJANGO_ALLOWED_HOSTS`: the backend Vercel hostname, for example `karmastat-api.vercel.app`
   - `DATABASE_URL`: a hosted PostgreSQL connection string (Neon, Supabase, or Vercel Postgres)
   - `CORS_ALLOWED_ORIGINS`: the frontend URL, for example `https://karmastat-ai.vercel.app`
   - `CSRF_TRUSTED_ORIGINS`: the same frontend URL
4. Deploy. The Django API is exposed through the existing backend app at `backend/karmastat/api/index.py`.
5. Run migrations against the hosted database from the local project:

```powershell
$env:DATABASE_URL="your-postgresql-url"
backend\venv\Scripts\python.exe backend\karmastat\manage.py migrate
```

The backend health check is `https://your-backend.vercel.app/api/test/`.

## Frontend

1. Create a second Vercel project from the same repository for the frontend.
2. Set the project root to `KarmaStat-AI-React`.
3. Set the environment variable:
   - `VITE_API_URL`: `https://your-backend.vercel.app/api` (the backend URL, not `karmastat-ai.vercel.app`)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.

For local development keep `VITE_API_URL=/api`; `vite.config.js` proxies it to `http://127.0.0.1:8000`.
For Vercel, set `VITE_API_URL` to the separate backend project URL and redeploy. Vercel does not use the local Vite proxy.

Do not use SQLite in production on Vercel. It is local/ephemeral; use PostgreSQL so users, profiles, quizzes, and analysis persist.

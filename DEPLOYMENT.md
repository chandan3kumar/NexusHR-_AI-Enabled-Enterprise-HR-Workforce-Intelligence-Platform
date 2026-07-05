# NexusHR Deployment

This repository is arranged for:

- Backend: Render web service from `backend/`
- Frontend: Vercel static site from `frontend/`
- Database: Render PostgreSQL or any managed PostgreSQL database

## 1. Render backend

Create a PostgreSQL database on Render, then create a new web service from this GitHub repository.

Use these settings:

- Root directory: repository root
- Runtime: Docker
- Dockerfile path: `backend/Dockerfile`
- Health check path: `/api/health`
- Plan: Free

Set these environment variables on Render:

- `SPRING_DATASOURCE_URL`: Render internal PostgreSQL JDBC URL, for example `jdbc:postgresql://host:5432/database`
- `SPRING_DATASOURCE_USERNAME`: database user
- `SPRING_DATASOURCE_PASSWORD`: database password
- `JWT_SECRET`: a long random secret
- `JWT_EXPIRATION`: `86400000`
- `ADMIN_BOOTSTRAP_ENABLED`: `true` only for first deployment
- `ADMIN_BOOTSTRAP_USERNAME`: your first admin username
- `ADMIN_BOOTSTRAP_EMAIL`: your first admin email
- `ADMIN_BOOTSTRAP_PASSWORD`: your first admin password
- `CORS_ALLOWED_ORIGINS`: your Vercel URL, for example `https://your-app.vercel.app`

After the first admin is created and you can log in, set `ADMIN_BOOTSTRAP_ENABLED=false`.

## 2. Vercel frontend

Import the same GitHub repository into Vercel.

Use these settings:

- Root directory: `frontend`
- Framework preset: Other
- Build command: leave empty
- Output directory: leave empty

Set this environment variable on Vercel:

- `BACKEND_ORIGIN`: your Render backend URL, for example `https://nexushr-backend.onrender.com`

The frontend calls `/api/...`; Vercel forwards those requests to Render through `frontend/api/[...path].js`.

## 3. Free tier note

Render free services sleep when inactive. The first login or API call after sleep can take time while the backend wakes up.

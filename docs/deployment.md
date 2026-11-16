# Deployment Guide for SuccessHUB

SuccessHUB is configured as a full-stack monorepo (Express API + Vite React client). You can deploy it as a single unified service (easiest & most cost-effective) or split between frontend and backend.

---

## 1. Unified Single-Service Deployment (Recommended: Render / Railway / Docker)

In this mode, Express serves both the REST API (`/api/*`) and the compiled React production assets (`/`).

### Option A: Deploy on Render

1. Push your repository to GitHub or GitLab.
2. Log into [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** > **Web Service**.
4. Connect your GitHub repository.
5. Render can detect `render.yaml` automatically, or configure manually:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
6. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<your MongoDB Atlas connection string>`
   - `CORS_ORIGIN`: `*` (or your Render URL)
7. Click **Deploy Web Service**.

---

### Option B: Deploy with Docker (Railway, Fly.io, AWS ECS, DigitalOcean)

The project includes an optimized multi-stage `Dockerfile`:

```bash
# Build Docker image
docker build -t successhub .

# Run container
docker run -p 4000:4000 \
  -e NODE_ENV=production \
  -e MONGODB_URI="your_mongodb_uri" \
  -e CORS_ORIGIN="*" \
  successhub
```

---

## 2. Split Deployment (Backend on Render/Railway, Frontend on Vercel)

### Backend (Express on Render/Railway)
- Root Directory: `backend` or use the monorepo root.
- Build command: `npm install && npm run build:backend`
- Start command: `node backend/dist/server.js`
- Set `CORS_ORIGIN`: your Vercel URL (e.g., `https://successhub.vercel.app`)

### Frontend (React on Vercel)
- Framework Preset: `Vite`
- Root Directory: `frontend`
- Build command: `npm run build`
- Output Directory: `dist`

---

## 3. Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `production` in live environments |
| `PORT` | Auto | Set automatically by most cloud providers (defaults to `4000`) |
| `MONGODB_URI` | Yes | MongoDB Atlas or connection string |
| `CORS_ORIGIN` | No | Frontend URL or `*` to allow cross-origin requests |
| `RAZORPAY_KEY_ID` | Optional | Razorpay key ID for payment features |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Razorpay webhook verification secret |

# 🚀 Mountaineer Mallu — Enterprise Deployment Guide

This guide covers production deployment for the **Mountaineer Mallu** full-stack application across various environments (Docker, Kubernetes, Cloud PaaS, Vercel, and standalone Linux servers).

---

## Architecture Overview

```
                        ┌───────────────────────────────┐
                        │   Internet / CDN (Cloudflare) │
                        └───────────────┬───────────────┘
                                        │ (HTTPS: 443)
                                        ▼
                        ┌───────────────────────────────┐
                        │    Reverse Proxy / Load Bal   │
                        │    (NGINX / AWS ALB / Ingress)│
                        └───────────────┬───────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 │                                             │
                 ▼                                             ▼
  ┌─────────────────────────────┐               ┌─────────────────────────────┐
  │   Unified Monolith Node.js  │               │      Decoupled Option       │
  │   - Express API (/api/*)    │               │  - Vercel (Frontend React)  │
  │   - Static SPA (/dist/*)    │               │  - Render/Railway (Backend) │
  │   - Socket.io Realtime WS   │               └─────────────────────────────┘
  └──────────────┬──────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
 ┌─────────────┐   ┌─────────────┐
 │ MongoDB 7.0 │   │  Redis 7.0  │
 │ (Atlas/VPS) │   │ (Cache/Rate)│
 └─────────────┘   └─────────────┘
```

---

## 1. Quick Start: Docker Compose (All-in-One)

Deploy the entire stack (App, MongoDB, Redis) in one command:

```bash
# 1. Clone repo and enter directory
git clone https://github.com/Allen73737/mountaineer_mallu.git
cd mountaineer_mallu

# 2. Configure production environment
cp backend/.env.example backend/.env
# Edit backend/.env with your production secrets (JWT_SECRET, MongoDB or Cloudinary)

# 3. Build and launch container stack
docker compose up -d --build

# 4. Verify stack health
docker compose ps
curl http://localhost:5000/healthz
```

The app is now live at `http://localhost:5000` with automated health checks, restart policies, and persistent storage.

---

## 2. Cloud PaaS Deployment (Render / Railway / Fly.io)

### Option A: Unified Full-Stack (Recommended)
1. **Repository Settings**:
   - **Root Directory**: `.`
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
2. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or platform default)
   - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster.mongodb.net/mountaineer-mallu`
   - `JWT_SECRET`: `<secure-random-32-character-secret>`
   - `CLIENT_URL`: `https://your-domain.com`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `RESEND_API_KEY`

### Option B: Decoupled (Vercel Frontend + Render Backend)
1. **Frontend (Vercel)**:
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables:
     - `VITE_API_URL`: `https://your-backend-api.onrender.com`
     - `VITE_GOOGLE_CLIENT_ID`: `<your-google-oauth-client-id>`
2. **Backend (Render / Railway)**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment Variables:
     - `CLIENT_URL`: `https://your-frontend.vercel.app`

---

## 3. Kubernetes / Cloud Native Deployment

### Liveness and Readiness Probes
Mountaineer Mallu includes standard enterprise probes:

- **Liveness Probe**: `GET /livez` (returns `200 OK`)
  ```yaml
  livenessProbe:
    httpGet:
      path: /livez
      port: 5000
    initialDelaySeconds: 15
    periodSeconds: 20
  ```
- **Readiness Probe**: `GET /healthz` (verifies MongoDB & Redis connections; returns `200` when ready, `503` when degraded)
  ```yaml
  readinessProbe:
    httpGet:
      path: /healthz
      port: 5000
    initialDelaySeconds: 10
    periodSeconds: 10
  ```

### Graceful Shutdown
The server listens to `SIGTERM` and `SIGINT`:
- Rejects new HTTP connections immediately
- Disconnects WebSocket clients cleanly
- Flushes active logs
- Closes Redis and MongoDB connections safely
- Guaranteed termination within a 10-second grace window

---

## 4. Production Security Checklist

- [x] **Reverse Proxy Trust**: `app.set('trust proxy', 1)` enabled for load balancers (AWS ALB / Nginx / Cloudflare).
- [x] **Cookie Hardening**: `httpOnly`, `secure`, and `sameSite: none` (or `lax`) enabled in production.
- [x] **Strict Content Security Policy & Security Headers**: Helmet enabled on backend; Vercel security headers configured on frontend.
- [x] **Startup Env Validation**: Fails fast if critical secrets or database URIs are missing or set to placeholder defaults.
- [x] **Static Asset Caching**: 1-year immutable caching on hashed build assets (`/assets/*`).
- [x] **HTTP Compression**: Gzip/Brotli payload compression enabled on all JSON API responses.
- [x] **Non-Root Container**: Dockerfile executes under dedicated `node` user (UID 1000).

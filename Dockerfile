# ═══════════════════════════════════════════════════════════════
# MOUNTAINEER MALLU — ENTERPRISE MULTI-STAGE PRODUCTION DOCKERFILE
# ═══════════════════════════════════════════════════════════════

# ── Stage 1: Build Frontend ──────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
# Vite bakes these into the bundle at build time (.env files are excluded from the image).
# VITE_API_URL stays empty: the API is served from the same origin as the site.
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_SENTRY_DSN=""
ARG VITE_ANALYTICS_DOMAIN=""
ARG VITE_CDN_URL=""
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID VITE_SENTRY_DSN=$VITE_SENTRY_DSN VITE_ANALYTICS_DOMAIN=$VITE_ANALYTICS_DOMAIN VITE_CDN_URL=$VITE_CDN_URL
RUN npm run build

# ── Stage 2: Install Production Backend Dependencies ─────────
FROM node:20-alpine AS backend-deps
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

# ── Stage 3: Production Minimal Runner ───────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Security: Install ca-certificates and dumb-init
RUN apk add --no-cache ca-certificates dumb-init

ENV NODE_ENV=production
ENV PORT=5000

# Copy compiled backend dependencies and application code
COPY --chown=node:node backend/package.json ./backend/
COPY --from=backend-deps --chown=node:node /app/backend/node_modules ./backend/node_modules
COPY --chown=node:node backend/ ./backend/

# Copy compiled frontend distribution for unified production serving
COPY --from=frontend-builder --chown=node:node /app/frontend/dist ./frontend/dist

# Switch to non-root user for enterprise container security compliance
USER node

WORKDIR /app/backend

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/livez || exit 1

EXPOSE 5000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "--import", "./tracing.js", "server.js"]

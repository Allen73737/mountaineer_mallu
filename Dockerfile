# ═══════════════════════════════════════════════════════════════
# MOUNTAINEER MALLU — ENTERPRISE MULTI-STAGE PRODUCTION DOCKERFILE
# ═══════════════════════════════════════════════════════════════

# ── Stage 1: Build Frontend ──────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
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
CMD ["node", "server.js"]

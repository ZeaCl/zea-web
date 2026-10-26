# ============================================================================
# Dockerfile — ZEA Web Enterprise Landing & Diagnostics (zea.cl)
# Multi-stage production build for SvelteKit with adapter-node
# ============================================================================

# Stage 1: Build the SvelteKit application
FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./

# Install dependencies cleanly and ensure rollup binary is available
RUN npm ci --legacy-peer-deps

COPY . .

# Generate SvelteKit types, build production bundle, and run typecheck
RUN npm run build && npm run check

# Prune devDependencies to keep runtime image minimal and secure
RUN npm prune --omit=dev

# Stage 2: Production runner
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --chown=node:node --from=builder /app/package.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/build ./build

# Run container as unprivileged node user
USER node

EXPOSE 3000

CMD ["node", "build/index.js"]

# Root Dockerfile to build backend service (monorepo)
# Multi-stage build mirrors backend/Dockerfile but works from repo root

FROM node:20-slim AS builder
WORKDIR /app

# Copy backend package files and prisma schema
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install deps for build
RUN npm ci && npm cache clean --force

# Copy backend source
COPY backend/. .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:20-slim
WORKDIR /app

# Install dependencies needed for runtime
RUN apt-get update && apt-get install -y openssl libssl-dev dumb-init && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r nodejs --gid=1001 && useradd -r -g nodejs --uid=1001 nodejs

# Install production deps
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built app and prisma artifacts
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist

USER nodejs
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]

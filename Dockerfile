# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root and workspace manifests
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy source files
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build backend and frontend
RUN npm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Copy root and workspace manifests
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled artifacts from builder stage
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 4000

CMD ["node", "backend/dist/server.js"]

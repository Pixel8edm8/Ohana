# Build stage for frontend (Vite + React + TypeScript)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies (needed for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Run frontend build
RUN npm run build

# Production stage with Node.js runtime
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files from builder stage
COPY --from=builder /app/package*.json ./

# Copy built frontend assets
COPY --from=builder /app/dist ./dist

# Install production dependencies only
RUN npm ci --production --omit=dev || npm install --production --omit=dev

# Set ownership to non-root user
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the backend server
CMD ["node", "backend/server.js"]
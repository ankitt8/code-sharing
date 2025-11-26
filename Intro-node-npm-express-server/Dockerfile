# Multi-stage build for React + Express app

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for webpack)
RUN npm ci

# Copy source files
COPY . .

# Build the React app with webpack
RUN npm run build

# Stage 2: Production server
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy server files
COPY server.js ./
COPY .env* ./

# Copy built React app from builder stage
COPY --from=frontend-builder /app/dist ./dist

# Expose the port (Cloud Run uses PORT environment variable)
ENV PORT=8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8080) + '/', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start the server
CMD ["node", "server.js"]


# ============================================================
# Stage 1: Development (nodemon hot-reload)
# ============================================================
FROM node:22-alpine AS development

WORKDIR /app

# Install dependencies first (cache layer)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]


# ============================================================
# Stage 2: Production (lean, optimized)
# ============================================================
FROM node:22-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code (no devDependencies, no node_modules)
COPY . .

# Create uploads directory in case it doesn't exist
RUN mkdir -p uploads/products

EXPOSE 3000

# Run as non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

CMD ["node", "server.js"]

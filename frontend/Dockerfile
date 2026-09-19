# ============================================================
# Stage 1: Builder — install deps and build React app
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files first (cache layer)
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build for production (uses .env.production automatically via Vite)
RUN npm run build


# ============================================================
# Stage 2: Production — serve built files with Nginx
# ============================================================
FROM nginx:alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

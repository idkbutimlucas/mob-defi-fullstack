# syntax=docker/dockerfile:1

# ============================================
# Base image with Node.js 20
# ============================================
FROM node:20-alpine AS base

WORKDIR /app

# ============================================
# Development stage
# ============================================
FROM base AS development

# Install dependencies for node-gyp (if needed)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
# Use npm install for first build, npm ci when package-lock.json exists
RUN npm install

# Copy application source
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ============================================
# Build stage
# ============================================
FROM base AS build

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy application source
COPY . .

# Build for production
RUN npm run build

# ============================================
# Production stage with nginx
# ============================================
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Use lightweight Node.js
FROM node:20-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and lockfile for caching
COPY ../backend/package.json ../backend/pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy backend source
COPY ../backend ./

# Expose backend port
EXPOSE 3000

# Run backend dev server
CMD ["npm", "run", "dev"]

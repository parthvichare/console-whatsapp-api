# =========================
# Base Stage
# =========================
FROM node:20.15.0-alpine AS base

# Working directory
WORKDIR /usr/app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json tsconfig.json ./
COPY library ./library

# Install dependencies
RUN pnpm install

# Copy source
COPY src ./src

# Build app
RUN pnpm run build

# Debug
RUN ls -la dist/

# =========================
# Development Stage
# =========================
FROM base AS development

# Create upload directories
RUN mkdir -p /usr/app/uploads/temp
RUN mkdir -p /usr/app/uploads/contacts
RUN mkdir -p /usr/app/uploads/media

EXPOSE 8000

CMD ["pnpm", "run", "dev"]

# =========================
# Production Stage
# =========================
FROM node:20.15.0-alpine AS production

WORKDIR /usr/app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json tsconfig.json ./
COPY library ./library

# Install production dependencies
RUN pnpm install --production

# Copy build files
COPY --from=base /usr/app/dist ./dist

# Copy startup script
COPY start-all.sh ./

# Make executable
RUN chmod +x start-all.sh

# Create upload directories
RUN mkdir -p /usr/app/uploads/temp
RUN mkdir -p /usr/app/uploads/contacts
RUN mkdir -p /usr/app/uploads/media

# Environment
ENV PORT=8000

# Expose app port
EXPOSE 8000

# Start app
CMD ["./start-all.sh"]
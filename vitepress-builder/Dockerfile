# Stage 1: Install tooling
FROM node:25-alpine AS base

WORKDIR /app

# ENV PNPM_HOME=/root/.local/share/pnpm
# ENV PATH=/root/.local/share/pnpm:${PATH}

RUN npm install -g corepack@latest --force
RUN corepack enable && corepack prepare pnpm@latest --activate

# STAGE 2: Install dependencies
FROM base AS deps
COPY .npmrc ./
COPY package*.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# STAGE 3: Full source + dependencies -> watcher
FROM deps AS builder

COPY . .

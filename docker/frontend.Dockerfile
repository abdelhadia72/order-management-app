FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN pnpm install --frozen-lockfile

FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
WORKDIR /app/apps/backend
CMD ["pnpm", "start:dev"]

FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
WORKDIR /app/apps/backend
RUN pnpm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/package.json ./
CMD ["node", "dist/main"]

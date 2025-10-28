# ---------- Base image ----------
FROM node:22-alpine3.22 AS base
WORKDIR /app

# ---------- Install dependencies ----------
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm install --frozen-lockfile

# ---------- Build Next.js app ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- Run production build ----------
FROM base AS runner
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]

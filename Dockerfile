FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci

COPY tsconfig.json vitest.config.ts ./
COPY src ./src/

RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN npx prisma generate

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push && node dist/server.js"]

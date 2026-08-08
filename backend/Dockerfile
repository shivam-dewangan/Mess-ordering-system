# ---------- Stage 1: Dependencies ----------
FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev


# ---------- Stage 2: Production ----------
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]

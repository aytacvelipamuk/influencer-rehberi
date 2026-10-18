# Next 16 standalone; veri ve talepler kalıcı diskte (/data), imajda kişi verisi yok.
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 \
    REHBER_DATA_DIR=/data/rehber REHBER_TALEP_DIR=/data/talepler
RUN mkdir -p /data/rehber /data/talepler && chown -R node:node /data
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/ornek-veri ./ornek-veri
USER node
EXPOSE 3000
CMD ["node", "server.js"]

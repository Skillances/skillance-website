# syntax=docker/dockerfile:1

# ---- build the SPA and bundle the sidecar -------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# VITE_* values are compiled into the bundle, so they must be build arguments.
ARG VITE_API_BASE_URL
ARG VITE_AUTH_REFRESH_COOKIE
ARG VITE_PUBLIC_S3_CATEGORY_BASE
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_AUTH_REFRESH_COOKIE=$VITE_AUTH_REFRESH_COOKIE \
    VITE_PUBLIC_S3_CATEGORY_BASE=$VITE_PUBLIC_S3_CATEGORY_BASE

# Run tsc + vite directly: `npm run build` also runs the IndexNow postbuild ping.
RUN npx tsc -b && npx vite build
RUN npx esbuild server/sidecar.ts --bundle --platform=node --target=node22 --format=esm \
      --outfile=/app/sidecar/sidecar.mjs

# ---- runtime ------------------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

USER root
RUN apk add --no-cache nodejs
USER nginx

COPY --chown=nginx:nginx nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html
COPY --from=build --chown=nginx:nginx /app/sidecar/sidecar.mjs /opt/sidecar/sidecar.mjs
COPY --chown=nginx:nginx --chmod=755 nginx/40-start-sidecar.sh /docker-entrypoint.d/40-start-sidecar.sh

ENV SIDECAR_PORT=3001 \
    NODE_ENV=production
# Azure App Service reads this to find the container port.
ENV WEBSITES_PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

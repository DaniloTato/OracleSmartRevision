# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# Stage 1: Build Vite + React static assets
# -----------------------------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies using the lockfile present in the repo
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

RUN set -eux; \
    if [ -f package-lock.json ]; then \
        npm ci; \
    elif [ -f pnpm-lock.yaml ]; then \
        corepack enable pnpm; \
        pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then \
        corepack enable yarn; \
        yarn install --frozen-lockfile; \
    else \
        echo "No lockfile found (package-lock.json, pnpm-lock.yaml, yarn.lock)." >&2; \
        exit 1; \
    fi

COPY . .

RUN set -eux; \
    if [ -f pnpm-lock.yaml ]; then \
        pnpm run build; \
    elif [ -f yarn.lock ]; then \
        yarn build; \
    else \
        npm run build; \
    fi

# -----------------------------------------------------------------------------
# Stage 2: Serve static files with nginx
# -----------------------------------------------------------------------------
FROM nginx:alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]

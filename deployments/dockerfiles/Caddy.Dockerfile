# Двухступенчатая сборка портала.
#
# 1) node — устанавливает зависимости и собирает портал (tsc + vite build) в dist/;
# 2) caddy — лёгкий образ, в который попадают только готовые файлы из dist/
#    и Caddyfile. Node, исходники и node_modules в итоговый образ не попадают.
#
# Сборка из корня репозитория:
#   docker build -f deployments/dockerfiles/Caddy.Dockerfile -t portal .

FROM node:22-alpine AS portal
WORKDIR /src

# Сначала только файлы зависимостей — этот слой кешируется и не
# пересобирается, пока package*.json не изменились
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite вшивает переменные VITE_* в сборку, поэтому они задаются здесь,
# при сборке образа, а не при запуске контейнера. Если не переданы —
# в коде используются значения по умолчанию.
ARG VITE_INFERENCE_URL
ARG VITE_API_HOST
RUN npm run build

FROM caddy:alpine
COPY deployments/caddy/Caddyfile /etc/caddy/Caddyfile
COPY --from=portal /src/dist /srv
EXPOSE 80

FROM node:20-alpine AS build

WORKDIR /app

# Vite inlines env vars at build time, so this must be passed as a build ARG
# (Railway: set it under Settings -> Build -> Build Args on the frontend service)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY templates/default.conf.template /etc/nginx/templates/default.conf.template
# The base nginx:alpine image auto-runs envsubst on files in /etc/nginx/templates/
# at container start, substituting ${PORT} into /etc/nginx/conf.d/default.conf.
# Railway injects PORT dynamically; default here covers local docker-compose.
ENV PORT=80
EXPOSE 80
CMD sh -c 'echo "=== Resolved nginx config (PORT=$PORT) ==="; cat /etc/nginx/conf.d/default.conf; echo "==="; nginx -g "daemon off;"'
COPY templates/default.conf.template /etc/nginx/templates/default.conf.template
RUN cat /etc/nginx/templates/default.conf.template

# Build stage
FROM node:18-alpine as build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev

RUN npm install -g vite

COPY . .

RUN vite build

# Production stage
FROM nginx:alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html


COPY nginx.conf /etc/nginx/nginx.conf.template

EXPOSE 80


CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
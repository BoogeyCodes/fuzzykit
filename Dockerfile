# Multi-stage build: compile the explorer with Node, serve the static output with nginx.
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build:web

FROM nginx:alpine AS runtime
COPY --from=build /app/dist-web /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

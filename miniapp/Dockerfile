FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx template (uses ${PORT} substituted at runtime)
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

# Railway injects $PORT; envsubst replaces only ${PORT}, leaving nginx vars intact
CMD ["/bin/sh", "-c", \
  "envsubst '${PORT}' < /etc/nginx/templates/default.conf.template \
   > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

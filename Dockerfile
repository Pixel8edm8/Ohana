FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build without secrets using the "__VITE_GOOGLE_CLIENT_ID__" placeholder in your .env
RUN npm run build

FROM nginx:alpine AS runner
# Copy the custom Nginx configuration
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy the built Vite assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the injection script into Nginx's startup directory and make it executable
COPY inject-vars.sh /docker-entrypoint.d/99-inject-vars.sh
RUN chmod +x /docker-entrypoint.d/99-inject-vars.sh

EXPOSE 80
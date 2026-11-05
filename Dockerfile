FROM node:24-alpine
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps
EXPOSE 3000
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "3000"]
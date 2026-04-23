FROM node:20-alpine

WORKDIR /app

# Install dependencies first for caching
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

EXPOSE 5000

# Start server
CMD ["node", "server.js"]

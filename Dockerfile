# Stage 1: Build the React Frontend
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Setup Production Environment for Node.js Server + Puppeteer
FROM node:18-slim
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome"

# Install Google Chrome and necessary dependencies for Puppeteer
RUN apt-get update \
    && apt-get install -y wget gnupg ca-certificates \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependencies and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy server code and the built frontend from the builder stage
COPY --from=builder /app/dist ./dist
COPY server ./server
COPY api ./api

# Expose the port the app runs on
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
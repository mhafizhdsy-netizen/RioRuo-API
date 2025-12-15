# Stage 1: Build the React Frontend
# Using Node 20 for the build stage as well for consistency
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Setup Production Environment for Node.js Server + Puppeteer
# CRITICAL FIX: Upgraded from node:18-slim to node:20-slim to resolve "File is not defined" error
FROM node:20-slim
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome"

# Install Google Chrome and necessary dependencies for Puppeteer
# Using Debian's official repo is more stable than manual wget
RUN apt-get update \
    && apt-get install -y gnupg wget \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /usr/share/keyrings/google-archive-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-archive-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
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
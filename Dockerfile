# Gunakan Node.js versi LTS yang ringan (Slim) sebagai base image
FROM node:20-slim

# Install Google Chrome Stable dan dependensi sistem yang dibutuhkan Puppeteer
# Kita perlu menginstal library sistem manual karena menggunakan image 'slim'
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libxtst6 \
    --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# PENTING: Buat symlink karena kode browser.js Anda mencari /usr/bin/google-chrome
# sedangkan instalasi default seringkali bernama google-chrome-stable
RUN ln -s /usr/bin/google-chrome-stable /usr/bin/google-chrome

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json terlebih dahulu untuk caching layer
COPY package*.json ./

# Install dependensi project
RUN npm ci

# Copy seluruh source code
COPY . .

# Build aplikasi Frontend (React/Vite)
RUN npm run build

# Set Environment Variables
# Ini memaksa puppeteer menggunakan Chrome yang sudah kita install di atas
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

# Environment variable untuk memicu logika "Railway/Docker" di server/src/lib/browser.js
ENV RAILWAY_ENVIRONMENT=true
ENV PORT=5000
ENV NODE_ENV=production

# Expose port yang digunakan aplikasi
EXPOSE 5000

# Jalankan server
CMD ["npm", "run", "start:server"]
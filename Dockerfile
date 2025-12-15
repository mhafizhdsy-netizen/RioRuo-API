# Gunakan Node.js LTS versi Slim (Debian-based)
# Versi slim lebih ringan tapi tetap memiliki library standard yang dibutuhkan Chrome
FROM node:20-slim

# Install dependencies sistem yang dibutuhkan
# 1. wget & gnupg: untuk mengambil key signing Google
# 2. google-chrome-stable: Browser utama
# 3. fonts-*: Paket font agar rendering text halaman tidak kotak-kotak
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
       fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
       --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Working Directory
WORKDIR /app

# Konfigurasi Environment Variable untuk Puppeteer
# SKIP_CHROMIUM_DOWNLOAD: Agar npm install tidak mendownload chromium bawaan (hemat size & waktu)
# EXECUTABLE_PATH: Memberitahu Puppeteer lokasi Chrome Stable yang baru diinstall
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Copy file package.json dan package-lock.json
COPY package*.json ./

# Install dependencies Node.js
RUN npm install

# Copy seluruh source code
COPY . .

# Build Frontend (Vite) -> menghasilkan folder dist/
RUN npm run build

# Expose Port (Sesuaikan dengan PORT di server/index.js)
EXPOSE 5000

# Jalankan Server
CMD ["npm", "run", "start:server"]
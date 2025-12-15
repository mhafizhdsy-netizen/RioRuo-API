import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

puppeteer.use(StealthPlugin());

const getLocalChromePath = () => {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

let browserInstance = null;

export const getBrowser = async () => {
  // Return existing instance if valid
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  const isVercel = !!process.env.VERCEL;
  // Railway detection
  const isRailway = !!process.env.RAILWAY_ENVIRONMENT || !!process.env.RAILWAY_STATIC_URL || !!process.env.RAILWAY_DEPLOYMENT;
  const isProduction = process.env.NODE_ENV === 'production';

  let executablePath;
  let args = [];

  if (isRailway) {
    // RAILWAY (Docker)
    console.log('[Browser] Environment: Railway/Docker');
    executablePath = '/usr/bin/google-chrome';
    
    // CRITICAL ARGS FOR DOCKER
    args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Prevents OOM crashes in Docker
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-audio-output',
      '--disable-extensions'
    ];
  } else if (isVercel) {
    // VERCEL
    console.log('[Browser] Environment: Vercel (Serverless)');
    executablePath = await chromium.executablePath();
    args = [...chromium.args, '--disable-gpu', '--disable-dev-shm-usage'];
  } else {
    // LOCAL
    console.log('[Browser] Environment: Local');
    executablePath = getLocalChromePath();
    args = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'];
  }

  console.log(`[Browser] Launching... Path: ${executablePath}`);

  browserInstance = await puppeteer.launch({
    args,
    executablePath,
    headless: "new", // Use new headless mode
    ignoreHTTPSErrors: true,
    defaultViewport: null, // Allow viewport to be set by page
  });

  return browserInstance;
};

export const closeBrowser = async () => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
};
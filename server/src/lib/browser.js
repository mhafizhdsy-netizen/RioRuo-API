import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

// Helper to find local Chrome path for development
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
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
};

let browserInstance = null;

export const getBrowser = async () => {
  if (browserInstance) {
    return browserInstance;
  }

  // ENVIRONMENT DETECTION
  const isVercel = !!process.env.VERCEL;
  // Check common Railway environment variables or explicit flag
  const isRailway = !!process.env.RAILWAY_ENVIRONMENT || !!process.env.RAILWAY_STATIC_URL || !!process.env.RAILWAY_DEPLOYMENT;
  const isProduction = process.env.NODE_ENV === 'production';

  let executablePath;
  let args = chromium.args; // Default Vercel-optimized args

  if (isRailway) {
    // RAILWAY (Docker Container)
    // Use the Chrome installed via Dockerfile
    console.log('[Browser] Environment: Railway/Docker');
    executablePath = '/usr/bin/google-chrome';
    
    // Args for Docker environment (Standard Puppeteer args)
    args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Important for Docker memory limits
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ];

  } else if (isVercel) {
    // VERCEL (AWS Lambda Serverless)
    // Use sparticuz compressed binary
    console.log('[Browser] Environment: Vercel (Serverless)');
    executablePath = await chromium.executablePath();
    // chromium.args are already optimized for Lambda
    
  } else {
    // LOCAL DEVELOPMENT
    console.log('[Browser] Environment: Local Development');
    executablePath = getLocalChromePath();
    
    if (!executablePath) {
      console.error('ERROR: Could not find Google Chrome installed locally.');
      throw new Error('Local Chrome not found');
    }
    
    args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ];
  }

  console.log(`[Browser] Launching browser at: ${executablePath}`);

  browserInstance = await puppeteer.launch({
    args: args,
    defaultViewport: chromium.defaultViewport,
    executablePath: executablePath,
    // Force headless 'new' in production, railway, vercel.
    // Fallback to false (headful) only for local non-production dev.
    headless: (isVercel || isRailway || isProduction) ? 'new' : false,
    ignoreHTTPSErrors: true,
  });

  return browserInstance;
};

export const closeBrowser = async () => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
};
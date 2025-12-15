import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';
import path from 'path';

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

  // Determine if we are running on Vercel/AWS Lambda
  // @sparticuz/chromium works best in serverless. Local dev usually fails with it unless configured perfectly.
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

  let executablePath;
  let args = chromium.args;

  if (isProduction) {
    // Vercel / Production Environment
    // Use the sparticuz compressed binary
    executablePath = await chromium.executablePath();
  } else {
    // Local Development
    // Try to find local Chrome
    executablePath = getLocalChromePath();
    
    if (!executablePath) {
      console.error('ERROR: Could not find Google Chrome installed locally.');
      console.error('Since we are using puppeteer-core, you must have Chrome installed.');
      throw new Error('Local Chrome not found');
    }
    
    // Minimal args for local testing
    args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ];
  }

  console.log(`[Browser] Launching. Production Mode: ${isProduction}. Path: ${executablePath}`);

  browserInstance = await puppeteer.launch({
    args: args,
    defaultViewport: chromium.defaultViewport,
    executablePath: executablePath,
    headless: isProduction ? chromium.headless : false, // Headless in prod, visible in local (optional)
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
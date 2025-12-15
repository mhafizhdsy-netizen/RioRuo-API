// This file configures and manages the rebrowser-puppeteer instance for the application.
// It ensures that only one browser instance is running (singleton pattern) for efficiency.
import rebrowserPuppeteer from 'rebrowser-puppeteer'; // Use a clear name for the import
import { addExtra } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Enhance rebrowser-puppeteer with stealth capabilities
const puppeteer = addExtra(rebrowserPuppeteer);
const stealth = StealthPlugin();
// We manually override the user agent in apiClient.js, so disable this evasion
stealth.enabledEvasions.delete('user-agent-override');
puppeteer.use(stealth);

let browserInstance = null;

/**
 * Gets a single, shared instance of the Rebrowser browser.
 * Launches a new instance if one isn't already running.
 * @returns {Promise<import('puppeteer').Browser>}
 */
export const getBrowser = async () => {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  console.log('[Rebrowser] Launching a new Rebrowser instance with advanced stealth options...');

  // Control headless mode with an environment variable for easier local debugging
  // In production (e.g., Railway), it will default to 'new' (headless)
  const isHeadless = process.env.PUPPETEER_HEADLESS === 'false' ? false : 'new';
  console.log(`[Rebrowser] Headless mode: ${isHeadless === false ? 'false (visible browser)' : "'new' (background process)"}`);

  browserInstance = await puppeteer.launch({
    headless: isHeadless,
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-audio-output',
      '--disable-extensions',
      // Important arguments to disable features that can be detected by bot-checkers
      '--disable-features=Translate,AcceptCHFrame,MediaRouter,OptimizationHints,ProcessPerSiteUpToMainFrameThreshold,IsolateSandboxedIframes,AutomationControlled'
    ],
    defaultViewport: null,
    ignoreHTTPSErrors: true,
  });

  return browserInstance;
};

/**
 * Closes the shared browser instance if it's running.
 */
export const closeBrowser = async () => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    console.log('[Rebrowser] Shared browser instance closed.');
  }
};

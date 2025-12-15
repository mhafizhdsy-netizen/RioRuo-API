import { getBrowser } from './browser.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Define a list of realistic User-Agents to rotate
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

// Path for storing cookies
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COOKIES_PATH = path.join(__dirname, '..', '..', 'cookies.json');

const apiClient = {
  get: async (url, retries = 2) => {
    const browser = await getBrowser();
    let page = null;

    for (let i = 0; i < retries; i++) {
      try {
        page = await browser.newPage();
        
        const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
        console.log(`[ApiClient] Using User-Agent: ${userAgent}`);
        await page.setUserAgent(userAgent);
        
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"'
        });
        await page.setViewport({ width: 1920, height: 1080 });

        try {
            const cookiesString = await fs.readFile(COOKIES_PATH, 'utf-8');
            const cookies = JSON.parse(cookiesString);
            if (cookies.length > 0) {
              await page.setCookie(...cookies);
              console.log('[ApiClient] Successfully loaded cookies from previous session.');
            }
        } catch (e) {
            console.log('[ApiClient] No previous cookies found. Starting a fresh session.');
        }
        
        await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
        
        console.log(`[ApiClient] Attempt ${i + 1}/${retries}: Navigating to ${url}`);
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        let pageState = 'unknown';
        const maxChallengeAttempts = 8;
        for (let attempt = 1; attempt <= maxChallengeAttempts; attempt++) {
            console.log(`[ApiClient] Verifying page state, attempt ${attempt}/${maxChallengeAttempts}...`);
            try {
                const raceResult = await Promise.race([
                    page.waitForSelector('.venutama', { timeout: 15000 }).then(() => 'content_loaded'),
                    page.waitForSelector('body[class*="error404"]', { timeout: 15000 }).then(() => 'error_page'),
                    page.waitForSelector('iframe[src*="challenges.cloudflare.com"]', { timeout: 15000 }).then(() => 'challenge_detected'),
                ]);

                if (raceResult === 'content_loaded' || raceResult === 'error_page') {
                    pageState = 'success';
                    console.log(`[ApiClient] Verification successful: Page content or error page is visible.`);
                    break;
                }

                if (raceResult === 'challenge_detected') {
                    console.log('[ApiClient] Cloudflare challenge detected. Attempting to solve...');
                    const iframe = await page.$('iframe[src*="challenges.cloudflare.com"]');
                    if (iframe) {
                        // Click in the middle of the iframe to trigger the check
                        const box = await iframe.boundingBox();
                        if (box) {
                            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { delay: Math.random() * 150 });
                            console.log('[ApiClient] Clicked Cloudflare challenge iframe.');
                        }
                    }
                    // Wait for the page to process the click and potentially reload/change content
                    await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000));
                }
            } catch (e) {
                // This block catches the timeout from Promise.race
                console.warn(`[ApiClient] Wait for selectors timed out on attempt ${attempt}. Manually checking content.`);
                const content = await page.content();
                if (content.includes('venutama')) {
                    console.log('[ApiClient] Manual check successful: Found ".venutama".');
                    pageState = 'success';
                    break;
                } else {
                    console.warn('[ApiClient] Manual check failed. Content not found.');
                    if (attempt === maxChallengeAttempts) {
                        throw new Error(`Failed to find content or solve challenge after ${maxChallengeAttempts} attempts.`);
                    }
                }
            }
        }

        if (pageState !== 'success') {
            throw new Error(`Could not verify page content for ${url}. Stuck at challenge.`);
        }

        const cookies = await page.cookies();
        await fs.writeFile(COOKIES_PATH, JSON.stringify(cookies, null, 2));
        console.log(`[ApiClient] Successfully saved session cookies to ${COOKIES_PATH}`);

        console.log(`[ApiClient] Successfully fetched content from ${url}.`);
        const finalContent = await page.content();
        const finalStatus = response.status();
        await page.close();
        page = null;

        return {
            data: finalContent,
            status: finalStatus,
            headers: response.headers()
        };

      } catch (error) {
        console.error(`[ApiClient] Critical error on attempt ${i + 1} for ${url}:`, error.message);
        if (page) await page.close().catch(() => {});
        page = null;

        if (i === retries - 1) {
            throw error;
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    
    throw new Error(`[ApiClient] All ${retries} attempts failed for ${url}.`);
  }
};

export default apiClient;
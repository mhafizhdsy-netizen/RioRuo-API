import { getBrowser } from './browser.js';

const BASEURL = 'https://otakudesu.best';

const apiClient = {
  get: async (url) => {
    let browser = null;
    let page = null;

    try {
      browser = await getBrowser();
      page = await browser.newPage();

      // NOTE: Manual stealth injections (navigator.webdriver, etc.) have been removed.
      // puppeteer-extra-plugin-stealth handles this automatically now.

      // Set a realistic User-Agent (optional, as Stealth often sets a good one, but explicit is safe)
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
      
      // Standard headers
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
      });

      // Navigate to URL
      // 'networkidle2' allows Cloudflare scripts to finish loading
      const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // HUMANIZATION: Minimal mouse movement to satisfy "human" checks
      try {
        await page.mouse.move(100, 100);
        await page.mouse.move(200, 200, { steps: 10 });
      } catch (e) { /* ignore */ }

      // Cloudflare Check Logic
      // Even with Stealth, CF might briefly show the "Just a moment" page before redirecting.
      const title = await page.title();
      const content = await page.content();
      
      const isCloudflare = title.includes('Just a moment') || 
                           title.includes('Attention Required') || 
                           title.includes('Cloudflare') ||
                           content.includes('challenge-platform');

      if (isCloudflare) {
          console.log('[Puppeteer] Cloudflare challenge detected (Post-Stealth). Waiting for bypass...');
          
          // Wait for the main content selector of Otakudesu
          try {
            await page.waitForSelector('.venutama', { timeout: 30000 });
            console.log('[Puppeteer] Challenge passed, content loaded.');
          } catch (e) {
            console.log('[Puppeteer] Failed to bypass challenge or timeout waiting for content.');
          }
      }

      // Final Content Retrieval
      const finalContent = await page.content();
      
      // Validation: Check if we actually have anime content
      if (!finalContent.includes('venutama') && !finalContent.includes('post-body')) {
         const status = response ? response.status() : 0;
         // Only throw if it looks like a hard block (403/503) AND we didn't get content
         if (status >= 400 && status !== 404) {
            throw new Error(`Puppeteer blocked with status ${status}. Stealth failed.`);
         }
      }

      const finalStatus = response ? response.status() : 200;

      // Close the page immediately
      await page.close();
      page = null; 

      return {
        data: finalContent,
        status: finalStatus,
        headers: response ? response.headers() : {}
      };

    } catch (error) {
      console.error(`[ApiClient] Error fetching ${url}:`, error.message);
      if (page) await page.close().catch(() => {});
      throw error;
    }
  }
};

export default apiClient;
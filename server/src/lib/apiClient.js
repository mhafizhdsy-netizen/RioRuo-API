import { getBrowser } from './browser.js';

const BASEURL = 'https://otakudesu.best';

const apiClient = {
  get: async (url) => {
    let browser = null;
    let page = null;

    try {
      browser = await getBrowser();
      page = await browser.newPage();

      // Masking as a real user
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
      
      // Optimization: Block images and fonts to save bandwidth and speed up Cloudflare checks
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Navigate to URL
      // waitUntil: 'domcontentloaded' is usually enough and faster than 'networkidle0'
      // Timeout increased to 30s for safety
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Check for Cloudflare title or specific error indicators
      const title = await page.title();
      if (title.includes('Just a moment') || title.includes('Attention Required')) {
          console.log('[Puppeteer] Cloudflare challenge detected. Waiting for resolution...');
          // Simple wait logic for Cloudflare redirection
          await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
      }

      // Get the full HTML content
      const content = await page.content();
      const status = response ? response.status() : 200;

      // Close the page immediately to free resources
      await page.close();
      page = null; 

      if (status >= 400) {
        throw new Error(`Puppeteer request failed with status ${status}`);
      }

      // Return data in a format compatible with the existing "axios" style usage in utils
      // { data: html_string }
      return {
        data: content,
        status: status,
        headers: response ? response.headers() : {}
      };

    } catch (error) {
      console.error(`[ApiClient] Error fetching ${url}:`, error.message);
      
      // Attempt cleanup if error occurred
      if (page) await page.close().catch(() => {});
      // Note: We do not close the browser instance here to keep it warm for next requests (Singleton)
      
      throw error;
    }
  }
};

export default apiClient;
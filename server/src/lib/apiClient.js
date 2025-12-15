import { getBrowser } from './browser.js';

const BASEURL = 'https://otakudesu.best';

const apiClient = {
  get: async (url) => {
    let browser = null;
    let page = null;

    try {
      browser = await getBrowser();
      page = await browser.newPage();

      // STEALTH: Masking as a real user via strict header and property injection
      
      // 1. Override navigator.webdriver and mock plugins/chrome
      await page.evaluateOnNewDocument(() => {
        // Pass the Webdriver Test.
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });
        
        // Mock window.chrome
        window.chrome = {
          runtime: {},
          loadTimes: function() {},
          csi: function() {},
          app: {}
        };
        
        // Mock plugins to not look empty
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });
        
        // Mock languages
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });
      });

      // 2. Set modern User Agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
      
      // 3. Set standard headers to mimic a real browser request
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      });

      // Optimization: Block heavy media
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        // Block images, media, fonts. Allow scripts/stylesheets as they might drive Cloudflare challenges.
        if (['image', 'media', 'font'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Navigate to URL
      // Use domcontentloaded for speed, but wait long enough for scripts
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Cloudflare Check
      const title = await page.title();
      if (title.includes('Just a moment') || title.includes('Attention Required') || title.includes('Cloudflare')) {
          console.log('[Puppeteer] Cloudflare challenge detected. Waiting for resolution...');
          // Wait longer for redirection
          await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {
             console.log('[Puppeteer] Navigation timeout or no navigation occurred during wait.');
          });
      }

      // Get the full HTML content
      const content = await page.content();
      const status = response ? response.status() : 200;

      // Close the page immediately to free resources
      await page.close();
      page = null; 

      // If status is 403, it means we were blocked.
      // Note: Sometimes Cloudflare returns 403 on the "challenge" page, but if we passed it, 
      // the content should be the actual site. However, scrape scripts usually fail if the initial response was 403.
      // But scraping the *content* might work if the challenge completed inside the browser but the initial status code remains (unlikely).
      // We'll throw if it's 403 to trigger a retry or error message.
      if (status >= 400 && status !== 404) {
        throw new Error(`Puppeteer request failed with status ${status}`);
      }

      return {
        data: content,
        status: status,
        headers: response ? response.headers() : {}
      };

    } catch (error) {
      console.error(`[ApiClient] Error fetching ${url}:`, error.message);
      
      // Attempt cleanup if error occurred
      if (page) await page.close().catch(() => {});
      
      throw error;
    }
  }
};

export default apiClient;
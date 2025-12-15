import { getBrowser } from './browser.js';

const apiClient = {
  get: async (url) => {
    let browser = null;
    let page = null;

    try {
      browser = await getBrowser();
      page = await browser.newPage();

      // Basic Stealth handled by plugin in browser.js
      
      // Randomize Viewport slightly to look organic
      const width = 1920 + Math.floor(Math.random() * 100);
      const height = 1080 + Math.floor(Math.random() * 100);
      await page.setViewport({ width, height });

      // Headers setup
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Upgrade-Insecure-Requests': '1',
      });

      // 1. GOTO with extended timeout
      // domcontentloaded is faster than networkidle2, allowing us to handle Cloudflare manually sooner
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // 2. CHECK FOR CLOUDFLARE
      // Wait a moment for redirects or JS execution
      await new Promise(r => setTimeout(r, 2000));

      const title = await page.title();
      const content = await page.content();
      const isCloudflare = title.includes('Just a moment') || 
                           content.includes('challenge-platform') || 
                           content.includes('cf-turnstile');

      if (isCloudflare) {
          console.log('[Puppeteer] Cloudflare detected. Attempting bypass...');
          
          // Attempt to find and click turnstile iframes if they exist
          try {
            const frames = page.frames();
            for (const frame of frames) {
              const box = await frame.$('.ctp-checkbox-label input, input[type="checkbox"]');
              if (box) {
                console.log('[Puppeteer] Checkbox found in frame, clicking...');
                await box.click();
                await new Promise(r => setTimeout(r, 2000));
              }
            }
          } catch(e) { /* ignore click errors */ }

          // Wait specifically for the target content selector (.venutama is Otakudesu main container)
          // Increased timeout to 45s for slow challenges
          try {
            await page.waitForSelector('.venutama', { timeout: 45000 });
            console.log('[Puppeteer] Challenge passed, target content loaded.');
          } catch (e) {
            console.error('[Puppeteer] Timeout waiting for .venutama after challenge.');
            
            // Debug: Log what we are actually seeing if we timeout
            const finalTitle = await page.title();
            console.log(`[Puppeteer Debug] Stuck at title: "${finalTitle}"`);
          }
      }

      // 3. FINAL VALIDATION
      const finalContent = await page.content();
      const finalStatus = response ? response.status() : 0;

      // Check if we actually got the site content
      if (!finalContent.includes('venutama') && !finalContent.includes('post-body')) {
         // If status is 403/503 AND we don't have content, it's a block.
         if (finalStatus >= 400 && finalStatus !== 404) {
            throw new Error(`Cloudflare Blocked (Status: ${finalStatus}). HTML content not retrieved.`);
         }
      }

      // Close page explicitly
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
      // Do not close browser here, keep it warm for next requests (reused in browser.js)
      throw error;
    }
  }
};

export default apiClient;
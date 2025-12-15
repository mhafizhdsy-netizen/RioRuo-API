import { getBrowser } from './browser.js';

// User agent for a recent, common version of Chrome on Windows
const REALISTIC_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

const apiClient = {
  get: async (url, retries = 3) => {
    const browser = await getBrowser();
    let page = null;

    for (let i = 0; i < retries; i++) {
        try {
            page = await browser.newPage();
            
            // --- ENHANCED STEALTH ---
            await page.setUserAgent(REALISTIC_USER_AGENT);
            // Set modern "Client Hints" headers that Cloudflare checks
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Upgrade-Insecure-Requests': '1',
                'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            });

            // Randomize viewport slightly
            const width = 1920 + Math.floor(Math.random() * 100);
            const height = 1080 + Math.floor(Math.random() * 100);
            await page.setViewport({ width, height });

            console.log(`[ApiClient] Attempt ${i + 1}/${retries}: Navigating to ${url}`);
            const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            
            // Wait for a few seconds for any JS challenges or redirects to execute
            await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000));

            const title = await page.title();
            const content = await page.content();
            const isCloudflareChallenge = title.includes('Just a moment') || content.includes('challenge-platform') || content.includes('cf-turnstile');
            
            // If we are on a challenge page or get a hard 403, wait for it to resolve
            if (response.status() === 403 || isCloudflareChallenge) {
                console.warn(`[ApiClient] Cloudflare detected or 403 on attempt ${i + 1}. Title: "${title}". Waiting for navigation...`);
                
                // Smart Wait: Wait for either the main content selector or a known error body class.
                // This waits for the challenge to either succeed (load .venutama) or fail clearly.
                await page.waitForSelector('.venutama, body[class*="error404"]', { timeout: 45000 }); 
                console.log(`[ApiClient] Wait finished on attempt ${i + 1}. Re-evaluating page content.`);
            }

            // Final check after waiting
            const finalContent = await page.content();
            
            // Check if we successfully loaded the target site's content
            if (!finalContent.includes('venutama')) {
                // It could be a valid 404 page, which is not a block.
                if (finalContent.includes('Error 404')) {
                    console.log('[ApiClient] Reached a 404 page. Treating as a valid (empty) response.');
                    await page.close();
                    return { data: finalContent, status: 404, headers: response.headers() };
                }
                
                // If it's not a 404 and content is missing, it's a definite block.
                const errorMessage = `Failed to load target content on attempt ${i + 1}. Status: ${response.status()}. Title: "${await page.title()}"`;
                console.error(`[ApiClient] ${errorMessage}`);
                
                // If this is the last attempt, throw a definitive error.
                if (i === retries - 1) {
                   throw new Error(`Cloudflare Blocked after ${retries} attempts. ${errorMessage}`);
                }
                
                // Close the failed page and loop to the next retry.
                await page.close();
                page = null;
                continue;
            }
            
            // --- SUCCESS ---
            console.log(`[ApiClient] Successfully fetched content from ${url} on attempt ${i + 1}.`);
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

            // If this was the last retry, re-throw the original error to be handled upstream.
            if (i === retries - 1) {
                throw error;
            }
            // Wait a bit before the next retry.
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    
    // Fallback error if all retries fail for an unknown reason.
    throw new Error(`[ApiClient] All ${retries} attempts failed for ${url}.`);
  }
};

export default apiClient;
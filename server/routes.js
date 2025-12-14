import express from 'express';
import * as Scraper from './scraper.js';

const router = express.Router();

// Helper wrapper for try-catch with enhanced error info
const tryHandler = (fn) => async (req, res) => {
  try {
    const data = await fn(req);
    res.status(200).json({
      status: "success",
      creator: "Sanka Vollerei",
      message: "Data fetched successfully",
      data: data.data || data,
      pagination: data.pagination || null
    });
  } catch (error) {
    // Check if it's an Axios network/response error (unlikely with Selenium, but kept for safety)
    const isAxiosError = !!error.isAxiosError;
    const isSeleniumError = error.name === 'WebDriverError' || error.name === 'SessionNotCreatedError';
    
    // Extract detailed error info
    const upstreamUrl = error.config?.url || 'Unknown Target URL';
    const method = error.config?.method?.toUpperCase() || 'GET';
    const statusCode = error.response?.status || 500;
    const errorCode = error.code || error.name || 'UNKNOWN_ERROR';

    // Enhanced Server Logging
    console.error(`\n[Scraper Error] Request: ${req.method} ${req.originalUrl}`);
    
    if (isAxiosError) {
      console.error(`  ↳ Upstream Attempt: ${method} ${upstreamUrl}`);
      console.error(`  ↳ Failure: ${statusCode} ${error.response?.statusText} [${errorCode}]`);
    } else if (isSeleniumError) {
       console.error(`  ↳ Selenium Error: ${error.message.split('\n')[0]}`);
    } else {
      console.error(`  ↳ Internal/Parse Error: ${error.message}`);
    }
    
    // Construct descriptive user-facing message
    let clientMessage = error.message;
    let hint = "Check server logs for full stack trace.";

    if (isAxiosError) {
      if (statusCode === 404) {
        clientMessage = `Resource not found on upstream server (404).`;
      } else if (statusCode === 403) {
        clientMessage = `Access Forbidden (403). Blocked by Cloudflare?`;
      }
    } else if (isSeleniumError) {
       clientMessage = "Browser Automation Failed.";
       hint = "The server might lack Chrome binaries or memory. Ensure chromedriver is installed.";
       if(error.message.includes('element located')) {
           clientMessage = "Timeout waiting for page content.";
           hint = "The website is loading too slowly or structure changed.";
       }
    }

    // JSON Response
    res.status(statusCode === 200 ? 500 : statusCode).json({
      status: "error",
      message: clientMessage,
      code: statusCode,
      errorType: errorCode,
      endpoint: req.originalUrl,
      timestamp: new Date().toISOString(),
      hint: hint
    });
  }
};

// 1. Home Data
router.get('/home', tryHandler(Scraper.getHome));

// 2. Recent Anime (Pagination)
router.get('/recent', tryHandler(Scraper.getRecent));

// 3. Search Anime
router.get('/search', tryHandler(Scraper.getSearch));

// 4. Ongoing Anime
router.get('/ongoing', tryHandler(Scraper.getOngoing));

// 5. Completed Anime
router.get('/completed', tryHandler(Scraper.getCompleted));

// 6. Popular Anime
router.get('/popular', tryHandler(Scraper.getPopular));

// 7. Anime Movies
router.get('/movies', tryHandler(Scraper.getMovies));

// 8. Schedule
router.get('/schedule', tryHandler(Scraper.getSchedule));

// 9. Genres List
router.get('/genres', tryHandler(Scraper.getGenres));

// 10. Anime By Genre
router.get('/genres/:genreId', tryHandler(Scraper.getAnimeByGenre));

// 11. Batch List
router.get('/batch', tryHandler(Scraper.getBatchList));

// 12. Batch Detail
router.get('/batch/:batchId', tryHandler(Scraper.getBatchDetail));

// 13. Anime Detail & Episode List
router.get('/anime/:animeId', tryHandler(Scraper.getAnimeDetail));

// 14. Episode Stream Detail
router.get('/episode/:episodeId', tryHandler(Scraper.getEpisodeDetail));

// 15. Server Embed (Optional)
router.get('/server/:serverId', tryHandler(Scraper.getServerUrl));

export default router;
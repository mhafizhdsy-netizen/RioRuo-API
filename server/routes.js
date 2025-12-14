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
    // Extract detailed error info
    const errorCode = error.code || error.name || 'UNKNOWN_ERROR';
    const isNetworkError = errorCode === 'ECONNRESET' || errorCode === 'ETIMEDOUT';

    // Enhanced Server Logging
    console.error(`\n[Scraper Error] Request: ${req.method} ${req.originalUrl}`);
    console.error(`  ↳ Message: ${error.message}`);
    
    // Construct descriptive user-facing message
    let clientMessage = error.message;
    let statusCode = 500;

    if (error.response) {
       // Handle HTTP errors from Axios
       if (error.response.status === 404) {
           clientMessage = `Resource not found on samehadaku (404).`;
           statusCode = 404;
       } else if ([403, 503].includes(error.response.status)) {
           clientMessage = `Target site blocked the request (HTTP ${error.response.status}). The site might be under maintenance or protected by Cloudflare.`;
       }
    } else if (isNetworkError) {
        clientMessage = "Connection timed out connecting to Samehadaku.";
        statusCode = 504;
    }

    // JSON Response
    res.status(statusCode).json({
      status: "error",
      message: clientMessage,
      code: statusCode,
      errorType: errorCode,
      endpoint: req.originalUrl,
      timestamp: new Date().toISOString()
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

import { Router } from 'express';
import os from 'os';
import { execSync } from 'child_process';
import apicache from 'apicache';
import handler from '../handler/handler.js'; 

const api = Router();
const cache = apicache.middleware;

const CACHE_SHORT = '5 minutes';   
const CACHE_MEDIUM = '30 minutes'; 
const CACHE_LONG = '1 hour';       

api.get('/health', (_, res) => {
    const totalMem = os.totalmem() / (1024 * 1024 * 1024);
    const freeMem = os.freemem() / (1024 * 1024 * 1024);
    const platform = os.platform();
    const release = os.release();
    const arch = os.arch();
    let diskInfo = {};
    try {
      const df = execSync('df -h /').toString();
      const lines = df.trim().split('\n');
      const parts = lines[1].split(/\s+/);
      diskInfo = { size: parts[1], used: parts[2], avail: parts[3], usePercent: parts[4], mount: parts[5] };
    } catch {
      diskInfo = { error: 'Disk info unavailable' };
    }
    res.status(200).json({ status: 'OK', uptime: process.uptime(), timestamp: new Date().toISOString(), system: { ram: { totalGB: totalMem.toFixed(2), freeGB: freeMem.toFixed(2) }, os: { platform, release, arch }, disk: diskInfo } });
});

api.get('/', (_, res) => {
    res.status(200).json({ status: 'OK', Creator: 'RioRuo', Message: "Welcome to RioRuo API." });
});

api.get('/home', cache(CACHE_MEDIUM), handler.homeHandler);
api.get('/search/:keyword', cache(CACHE_SHORT), handler.searchAnimeHandler);
api.get('/ongoing-anime/:page?', cache(CACHE_SHORT), handler.ongoingAnimeHandler);
api.get('/complete-anime/:page?', cache(CACHE_LONG), handler.completeAnimeHandler);
api.get('/anime/:slug', cache(CACHE_LONG), handler.singleAnimeHandler);
api.get('/anime/:slug/episodes', cache(CACHE_LONG), handler.episodesHandler);
api.get('/anime/:slug/episodes/:episode', cache(CACHE_LONG), handler.episodeByEpisodeNumberHandler);
api.get('/episode/:slug', cache(CACHE_LONG), handler.episodeByEpisodeSlugHandler);
api.get('/batch/:slug', cache(CACHE_LONG), handler.batchByBatchSlugHandler);
api.get('/anime/:slug/batch', cache(CACHE_LONG), handler.batchHandler);
api.get('/genres', cache(CACHE_LONG), handler.genreListsHandler);
api.get('/genres/:slug/:page?', cache(CACHE_MEDIUM), handler.animeByGenreHandler);
api.get('/movies/:page?', cache(CACHE_MEDIUM), handler.moviesHandler);
api.get('/movies/:year/:month/:slug', cache(CACHE_LONG), handler.singleMovieHandler);
api.get('/jadwalRilis', cache(CACHE_MEDIUM), handler.jadwalRilisHandler);
api.get('/jadwal-rilis', cache(CACHE_MEDIUM), handler.jadwalRilisHandler);

api.get('/weather/:location', cache(CACHE_SHORT), handler.weatherHandler);
api.get('/weather/ascii/:location', cache(CACHE_SHORT), handler.weatherAsciiHandler);
api.get('/weather/quick/:location', cache(CACHE_SHORT), handler.weatherQuickHandler);
api.get('/weather/png/:location', cache(CACHE_SHORT), handler.weatherPngHandler);

api.get('/quotes/tag/:tag/:page?', cache(CACHE_SHORT), handler.quotesByTagHandler);
api.get('/quotes/:page?', cache(CACHE_SHORT), handler.quotesHandler);

api.post('/vgd', handler.vgdHandler);
api.post('/vgd/custom', handler.vgdCustomHandler);

api.get('/manga/page/:page?', cache(CACHE_SHORT), handler.komikuMangaPageHandler);
api.get('/manga/popular/:page?', cache(CACHE_MEDIUM), handler.komikuPopularHandler);
api.get('/manga/detail/:endpoint', cache(CACHE_LONG), handler.komikuDetailHandler);
api.get('/manga/search/:query', cache(CACHE_SHORT), handler.komikuSearchHandler);
api.get('/manga/genre', cache(CACHE_LONG), handler.komikuGenreListHandler);
api.get('/manga/genre/:endpoint/:page?', cache(CACHE_MEDIUM), handler.komikuGenreDetailHandler);
api.get('/manga/recommended', cache(CACHE_MEDIUM), handler.komikuRecommendedHandler);
api.get('/manhua/:page?', cache(CACHE_SHORT), handler.komikuManhuaHandler);
api.get('/manhwa/:page?', cache(CACHE_SHORT), handler.komikuManhwaHandler);
api.get('/chapter/:title', cache(CACHE_LONG), handler.komikuChapterHandler);

api.get('/samehadaku/home/:page?', cache(CACHE_MEDIUM), handler.samehadakuHomeHandler);
api.get('/samehadaku/anime/:slug', cache(CACHE_LONG), handler.samehadakuAnimeDetailHandler);
api.get('/samehadaku/stream/:slug', cache(CACHE_LONG), handler.samehadakuStreamHandler);
api.get('/samehadaku/search', cache(CACHE_SHORT), handler.samehadakuSearchHandler);

export default api;

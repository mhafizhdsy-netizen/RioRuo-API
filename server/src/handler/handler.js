
import otakudesu from '../otakudesu.js';
import komiku from '../utils/komiku.js';

const handleError = (res, e) => {
  console.log(e);
  
  if (e.code === 'ECONNABORTED') {
      return res.status(504).json({
          status: 'Error',
          message: 'Upstream Request Timed Out',
          hint: 'The upstream service is taking too long to respond. Please try again later.'
      });
  }

  const status = e.response?.status || 500;
  const message = e.message || 'Internal server error';
  const hint = status === 403 ? 'The origin server blocked the request (Cloudflare). Try again later or update headers.' : undefined;
  
  return res.status(status).json({ status: 'Error', message, hint });
};

const searchAnimeHandler = async (req, res) => {
  const { keyword } = req.params;
  let data;
  try{
    data = await otakudesu.search(keyword);
  } catch(e) {
    return handleError(res, e);
  }
  return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', Message: "Don't spam the request motherfucker!", data });
};

const homeHandler = async (_, res)  => {
  let data;
  try {
    data = await otakudesu.home();
  } catch(e) {
    return handleError(res, e);
  }
  return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', Message: "Don't spam the request motherfucker!", data });
};

const ongoingAnimeHandler = async (req, res) => {
  const { page } = req.params;
  if (page) {
    if (!parseInt(page)) return res.status(400).json({ status: 'Error', message: 'The page parameter must be a number!' });
    if (parseInt(page) < 1) return res.status(400).json({ status: 'Error', message: 'The page parameter must be greater than 0!' });
  }
  let result;
  try {
    result = page ? await otakudesu.ongoingAnime(parseInt(page)) : await otakudesu.ongoingAnime();
  } catch(e) {
    return handleError(res, e);
  }
  const { paginationData, ongoingAnimeData } = result;
  if (!paginationData) return res.status(440).json({ status: 'Error', message: 'There\'s nothing here ;_;' });
  return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', Message: "Don't spam the request motherfucker!", data: ongoingAnimeData, pagination: paginationData });
};

const completeAnimeHandler = async (req, res) => {
  const { page } = req.params;
  if (page) {
    if (!parseInt(page)) return res.status(400).json({ status: 'Error', message: 'The page parameter must be a number!' });
    if (parseInt(page) < 1) return res.status(400).json({ status: 'Error', message: 'The page parameter must be greater than 0!' });
  }
  let result;
  try {
    result = page ? await otakudesu.completeAnime(parseInt(page)) : await otakudesu.completeAnime();
  } catch(e) {
    return handleError(res, e);
  }
  const { paginationData, completeAnimeData } = result;
  if (!paginationData) return res.status(404).json({ status: 'Error', message: 'There\'s nothing here ;_;' });
  return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', Message: "Don't spam the request motherfucker!", data: completeAnimeData, pagination: paginationData });
};

const singleAnimeHandler = async (req, res) => {
  const { slug } = req.params;
  let data;
  try {
    data = await otakudesu.anime(slug);
  } catch(e) {
    return handleError(res, e);
  }
  if (!data) return res.status(404).json({ status: 'Error', message: 'There\'s nothing here ;_;' });
  return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', Message: "Don't spam the request motherfucker!", data });
};

const episodesHandler = async (req, res) => {
  const { slug } = req.params;
  let data;
  try {
    data = await otakudesu.episodes(slug);
  } catch(e) {
    return handleError(res, e);
  }
  if (!data) return res.status(404).json({ status: 'Error', message: 'There\'s nothing here ;_;' });
  return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', Message: "Don't spam the request motherfucker!", data });
};

const episodeByEpisodeSlugHandler = async (req, res) => {
  const { slug } = req.params;
  let data;
  try {
    data = await otakudesu.episode({ episodeSlug:  slug });
  } catch (e) {
    return handleError(res, e);
  }
  if (!data) return res.status(404).json({ status: 'Error', message: 'There\'s nothing here ;_;' });
  return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', Message: "Don't spam the request motherfucker!", data });
};

const episodeByEpisodeNumberHandler = async (req, res) => {
  const { slug: animeSlug, episode } = req.params;
  if (!parseInt(episode)) return res.status(400).json({ status: 'Error', message: 'The episode NUMBER parameter must be a NUMBER!' });
  if (parseInt(episode) < 1) return res.status(400).json({ status: 'Error', message: 'The episode number parameter must be greater than 0!' });
  let data;
  try {
    data = await otakudesu.episode({ animeSlug, episodeNumber: parseInt(episode) });
  } catch (e) {
    return handleError(res, e);
  }
  if (!data) return res.status(404).json({ status: 'Error', message: 'There\'s nothing here ;_;' });
  return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', Message: "Don't spam the request motherfucker!", data });
};

const batchByBatchSlugHandler = async (req, res) => {
  const { slug } = req.params;
  let data;
  try {
    data = await otakudesu.batch({ batchSlug: slug });
  } catch(e) {
    return handleError(res, e);
  }
  return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', Message: "Don't spam the request motherfucker!", data });
};

const batchHandler = async (req, res) => {
  const { slug } = req.params;
  let data;
  try {
    data = await otakudesu.batch({ animeSlug: slug });
  } catch(e) {
    return handleError(res, e);
  }
  return data ? res.status(200).json({ status: 'Ok', Creator: 'RioRuo', Message: "Don't spam the request motherfucker!", data }) : res.status(404).json({
    status: 'Error',
    message: 'This anime doesn\'t have a batch yet ;_;'
  });
};

const genreListsHandler = async (_, res) => {
  let data;
  try {
    data = await otakudesu.genreLists();
  } catch(e) {
    return handleError(res, e);
  }
  return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', Message: "Don't spam the request motherfucker!", data });
};

const animeByGenreHandler = async (req, res) => {
  const { slug, page } = req.params;
  if (page) {
    if (!parseInt(page)) return res.status(400).json({ status: 'Error', message: 'The page parameter must be a number!' });
    if (parseInt(page) < 1) return res.status(400).json({ status: 'Error', message: 'The page parameter must be greater than 0!' });
  }
  let data;
  try {
    data = await otakudesu.animeByGenre(slug, page);
  } catch(e) {
    return handleError(res, e);
  }
  return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', Message: "Don't spam the request motherfucker!", data });
};

const jadwalRilisHandler = async (_, res) => {
    let data;
    try {
        data = await otakudesu.jadwalRilis();
    } catch (e) {
        return handleError(res, e);
    }
    if (!data || data.length === 0) {
        return res.status(404).json({ status: 'Error', message: 'There\'s nothing here ;_;' });
    }
    return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', Message: "Don't spam the request motherfucker!", data });
};

const moviesHandler = async (req, res) => {
    const { page } = req.params;
    if (page) {
        if (!parseInt(page)) return res.status(400).json({ status: 'Error', message: 'The page parameter must be a number!' });
        if (parseInt(page) < 1) return res.status(400).json({ status: 'Error', message: 'The page parameter must be greater than 0!' });
    }
    let data;
    try {
        data = await otakudesu.movies(page);
    } catch (e) {
        return handleError(res, e);
    }
    return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', Message: "Don't spam the request motherfucker!", data });
};

const singleMovieHandler = async (req, res) => {
    const { year, month, slug } = req.params;
    const fullSlug = `/${year}/${month}/${slug}`;
    let data;
    try {
        data = await otakudesu.movie(fullSlug);
    } catch (e) {
        return handleError(res, e);
    }
    if (!data) return res.status(404).json({ status: 'Error', message: 'There\'s nothing here ;_;' });
    return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', Message: "Don't spam the request motherfucker!", data });
};

const weatherHandler = async (req, res) => {
    try {
        const { location } = req.params;
        const lang = req.query.lang || 'en';
        const data = await otakudesu.weather.getWeather(location, lang);
        return res.status(200).json(data);
    } catch (e) {
        return handleError(res, e);
    }
};

const weatherAsciiHandler = async (req, res) => {
    try {
        const { location } = req.params;
        const lang = req.query.lang || 'en';
        const format = req.query.format;
        const data = await otakudesu.weather.getWeatherAscii(location, lang, format);
        if (format === 'json') {
            return res.status(200).json(data);
        } else {
            return res.type('text/plain').send(data);
        }
    } catch (e) {
        return handleError(res, e);
    }
};

const weatherQuickHandler = async (req, res) => {
    try {
        const { location } = req.params;
        const lang = req.query.lang || 'en';
        const data = await otakudesu.weather.getWeatherQuick(location, lang);
        return res.status(200).json(data);
    } catch (e) {
        return handleError(res, e);
    }
};

const weatherPngHandler = async (req, res) => {
    try {
        const { location } = req.params;
        const data = await otakudesu.weather.getWeatherPng(location);
        return res.type('image/png').send(data);
    } catch (e) {
        return handleError(res, e);
    }
};

const quotesHandler = async (req, res) => {
    try {
        const { page } = req.params;
        if (page) {
            if (!parseInt(page)) return res.status(400).json({ status: 'Error', message: 'The page parameter must be a number!' });
            if (parseInt(page) < 1) return res.status(400).json({ status: 'Error', message: 'The page parameter must be greater than 0!' });
        }
        const pageNumber = page ? parseInt(page) : 1;
        const data = await otakudesu.quotes.getQuotes(pageNumber);
        return res.status(200).json({
            status: "Ok", 
            Creator: "RioRuo", 
            Message: "Don't spam the request motherfucker!",
            ...data 
        });
    } catch (e) {
        return handleError(res, e);
    }
};

const quotesByTagHandler = async (req, res) => {
    try {
        const { tag, page } = req.params;
        if (page) {
            if (!parseInt(page)) return res.status(400).json({ status: 'Error', message: 'The page parameter must be a number!' });
            if (parseInt(page) < 1) return res.status(400).json({ status: 'Error', message: 'The page parameter must be greater than 0!' });
        }
        const pageNumber = page ? parseInt(page) : 1;
        const data = await otakudesu.quotes.getQuotesByTag(tag, pageNumber);
        return res.status(200).json({
            status: "Ok", 
            Creator: "RioRuo", 
            Message: "Don't spam the request motherfucker!",
            ...data
        });
    } catch (e) {
        return handleError(res, e);
    }
};

const vgdHandler = async (req, res) => {
    try {
        const { longUrl } = req.body;
        if (!longUrl || typeof longUrl !== 'string') {
            return res.status(400).json({ status: "Error", message: 'Field "longUrl" wajib diisi dan harus berupa string.' });
        }
        const result = await otakudesu.vgd.shorten(longUrl);
        return res.status(201).json({
            status: "Ok",
            Creator: "RioRuo",
            Message: "Don't spam the request motherfucker!",
            originalUrl: longUrl,
            shortUrl: result.shorturl,
            type: 'random'
        });
    } catch (e) {
        const msg = e.message.toLowerCase();
        let status = 400;
        if (msg.includes('exists') || msg.includes('taken')) status = 409;
        if (msg.includes('blocked') || msg.includes('limit')) status = 429;
        return res.status(status).json({ 
            status: "Error", 
            message: 'Gagal memperpendek URL.', 
            details: e.message 
        });
    }
};

const vgdCustomHandler = async (req, res) => {
    try {
        const { longUrl, customAlias } = req.body;
        if (!longUrl || typeof longUrl !== 'string') {
            return res.status(400).json({ status: "Error", message: 'Field "longUrl" wajib diisi dan harus berupa string.' });
        }
        if (!customAlias || typeof customAlias !== 'string') {
            return res.status(400).json({ status: "Error", message: 'Field "customAlias" wajib diisi.' });
        }
        if (!/^[a-zA-Z0-9-]+$/.test(customAlias)) {
            return res.status(400).json({ status: "Error", message: 'Custom alias hanya boleh mengandung huruf, angka, dan strip (-).' });
        }
        const result = await otakudesu.vgd.shortenCustom(longUrl, customAlias);
        return res.status(201).json({
            status: "Ok",
            Creator: "RioRuo",
            Message: "Don't spam the request motherfucker!",
            originalUrl: longUrl,
            shortUrl: result.shorturl,
            type: 'custom'
        });
    } catch (e) {
        const msg = e.message.toLowerCase();
        let status = 400;
        if (msg.includes('already in use') || msg.includes('already exists') || msg.includes('is taken')) {
            status = 409;
        }
        return res.status(status).json({
            status: "Error",
            message: 'Gagal membuat URL kustom.',
            details: e.message,
            suggestion: status === 409 ? 'Coba gunakan alias yang lain.' : undefined
        });
    }
};

const komikuMangaPageHandler = async (req, res) => {
    try {
        const { page } = req.params;
        const data = await komiku.getMangaPage(page);
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", Message: "Don't spam the request motherfucker!", manga_list: data });
    } catch (e) {
        return handleError(res, e);
    }
};

const komikuPopularHandler = async (req, res) => {
    try {
        const { page } = req.params;
        const data = await komiku.getPopularManga(page);
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", Message: "Don't spam the request motherfucker!", manga_list: data });
    } catch (e) {
        return handleError(res, e);
    }
};

const komikuDetailHandler = async (req, res) => {
    try {
        const { endpoint } = req.params;
        const data = await komiku.getMangaDetail(endpoint);
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", Message: "Don't spam the request motherfucker!", data });
    } catch (e) {
        return handleError(res, e);
    }
};

const komikuSearchHandler = async (req, res) => {
    try {
        const { query } = req.params;
        const data = await komiku.searchManga(query);
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", Message: "Don't spam the request motherfucker!", manga_list: data });
    } catch (e) {
        return handleError(res, e);
    }
};

const komikuGenreListHandler = async (req, res) => {
    try {
        const data = await komiku.getGenres();
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", Message: "Don't spam the request motherfucker!", list_genre: data });
    } catch (e) {
        return handleError(res, e);
    }
};

const komikuGenreDetailHandler = async (req, res) => {
    try {
        const { endpoint, page } = req.params;
        const data = await komiku.getAnimeByGenre(endpoint, page);
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", Message: "Don't spam the request motherfucker!", manga_list: data });
    } catch (e) {
        return handleError(res, e);
    }
};

const komikuRecommendedHandler = async (req, res) => {
    try {
        const data = await komiku.getRecommended();
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", Message: "Don't spam the request motherfucker!", manga_list: data });
    } catch (e) {
        return handleError(res, e);
    }
};

const komikuManhuaHandler = async (req, res) => {
    try {
        const { page } = req.params;
        const data = await komiku.getManhuaManhwa(page, 'manhua');
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", Message: "Don't spam the request motherfucker!", manga_list: data });
    } catch (e) {
        return handleError(res, e);
    }
};

const komikuManhwaHandler = async (req, res) => {
    try {
        const { page } = req.params;
        const data = await komiku.getManhuaManhwa(page, 'manhwa');
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", Message: "Don't spam the request motherfucker!", manga_list: data });
    } catch (e) {
        return handleError(res, e);
    }
};

const komikuChapterHandler = async (req, res) => {
    try {
        const { title } = req.params;
        const data = await komiku.getChapter(title);
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", Message: "Don't spam the request motherfucker!", data });
    } catch (e) {
        return handleError(res, e);
    }
};

const samehadakuHomeHandler = async (req, res) => {
    try {
        const { page } = req.params;
        if (page) {
            if (!parseInt(page)) return res.status(400).json({ status: 'Error', message: 'The page parameter must be a number!' });
            if (parseInt(page) < 1) return res.status(400).json({ status: 'Error', message: 'The page parameter must be greater than 0!' });
        }
        const pageNumber = page ? parseInt(page) : 1;
        const data = await otakudesu.samehadaku.getHome(pageNumber);
        return res.status(200).json({
            status: "Ok",
            Creator: "RioRuo",
            Message: "Don't spam the request motherfucker!",
            data
        });
    } catch (e) {
        return handleError(res, e);
    }
};

const samehadakuAnimeDetailHandler = async (req, res) => {
    try {
        const { slug } = req.params;
        const data = await otakudesu.samehadaku.getAnimeDetail(slug);
        return res.status(200).json({
            status: "Ok",
            Creator: "RioRuo",
            Message: "Don't spam the request motherfucker!",
            data
        });
    } catch (e) {
        return handleError(res, e);
    }
};

const samehadakuStreamHandler = async (req, res) => {
    try {
        const { slug } = req.params;
        const data = await otakudesu.samehadaku.getStreamDetail(slug);
        return res.status(200).json({
            status: "Ok",
            Creator: "RioRuo",
            Message: "Don't spam the request motherfucker!",
            data
        });
    } catch (e) {
        return handleError(res, e);
    }
};

export default {
  searchAnimeHandler,
  homeHandler,
  singleAnimeHandler,
  episodesHandler,
  ongoingAnimeHandler,
  completeAnimeHandler,
  episodeByEpisodeSlugHandler,
  episodeByEpisodeNumberHandler,
  batchByBatchSlugHandler,
  batchHandler,
  genreListsHandler,
  animeByGenreHandler,
  jadwalRilisHandler,
  moviesHandler,
  singleMovieHandler,
  weatherHandler,
  weatherAsciiHandler,
  weatherQuickHandler,
  weatherPngHandler,
  quotesHandler,
  quotesByTagHandler,
  vgdHandler,
  vgdCustomHandler,
  komikuMangaPageHandler,
  komikuPopularHandler,
  komikuDetailHandler,
  komikuSearchHandler,
  komikuGenreListHandler,
  komikuGenreDetailHandler,
  komikuRecommendedHandler,
  komikuManhuaHandler,
  komikuManhwaHandler,
  komikuChapterHandler,
  samehadakuHomeHandler,
  samehadakuAnimeDetailHandler,
  samehadakuStreamHandler
};

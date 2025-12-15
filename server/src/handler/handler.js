
import otakudesu from '../otakudesu.js';

const handleError = (res, e) => {
  console.log(e);
  const status = e.response?.status || 500;
  const message = e.message || 'Internal server error';
  // If it's a 403, it's likely Cloudflare blocking
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

  if (!paginationData) return res.status(404).json({ status: 'Error', message: 'There\'s nothing here ;_;' });
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

// --- Weather Handlers ---

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
        const format = req.query.format; // 'json' or undefined
        
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
        
        // Format is strictly enforced in utils/weather.js
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
        
        // Return as image
        return res.type('image/png').send(data);
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
  // Weather
  weatherHandler,
  weatherAsciiHandler,
  weatherQuickHandler,
  weatherPngHandler
};

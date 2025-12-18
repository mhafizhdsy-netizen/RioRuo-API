import otakudesu from '../otakudesu.js';
import komiku from '../utils/komiku.js';

const handleError = (res, e) => {
  console.error(e);
  
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
  try {
    const data = await otakudesu.search(keyword);
    return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', data });
  } catch(e) {
    return handleError(res, e);
  }
};

const homeHandler = async (_, res)  => {
  try {
    const data = await otakudesu.home();
    return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', data });
  } catch(e) {
    return handleError(res, e);
  }
};

const ongoingAnimeHandler = async (req, res) => {
  const { page } = req.params;
  try {
    const result = page ? await otakudesu.ongoingAnime(parseInt(page)) : await otakudesu.ongoingAnime();
    const { paginationData, ongoingAnimeData } = result;
    return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', data: ongoingAnimeData, pagination: paginationData });
  } catch(e) {
    return handleError(res, e);
  }
};

const completeAnimeHandler = async (req, res) => {
  const { page } = req.params;
  try {
    const result = page ? await otakudesu.completeAnime(parseInt(page)) : await otakudesu.completeAnime();
    const { paginationData, completeAnimeData } = result;
    return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', data: completeAnimeData, pagination: paginationData });
  } catch(e) {
    return handleError(res, e);
  }
};

const singleAnimeHandler = async (req, res) => {
  const { slug } = req.params;
  try {
    const data = await otakudesu.anime(slug);
    return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', data });
  } catch(e) {
    return handleError(res, e);
  }
};

const episodesHandler = async (req, res) => {
  const { slug } = req.params;
  try {
    const data = await otakudesu.episodes(slug);
    return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', data });
  } catch(e) {
    return handleError(res, e);
  }
};

const episodeByEpisodeSlugHandler = async (req, res) => {
  const { slug } = req.params;
  try {
    const data = await otakudesu.episode({ episodeSlug: slug });
    return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', data });
  } catch (e) {
    return handleError(res, e);
  }
};

const episodeByEpisodeNumberHandler = async (req, res) => {
  const { slug: animeSlug, episode } = req.params;
  try {
    const data = await otakudesu.episode({ animeSlug, episodeNumber: parseInt(episode) });
    return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', data });
  } catch (e) {
    return handleError(res, e);
  }
};

const batchByBatchSlugHandler = async (req, res) => {
  const { slug } = req.params;
  try {
    const data = await otakudesu.batch({ batchSlug: slug });
    return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', data });
  } catch (e) {
    return handleError(res, e);
  }
};

const batchHandler = async (req, res) => {
  const { slug } = req.params;
  try {
    const data = await otakudesu.batch({ animeSlug: slug });
    return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', data });
  } catch (e) {
    return handleError(res, e);
  }
};

const genreListsHandler = async (_, res) => {
  try {
    const data = await otakudesu.genreLists();
    return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', data });
  } catch(e) {
    return handleError(res, e);
  }
};

const animeByGenreHandler = async (req, res) => {
  const { slug, page } = req.params;
  try {
    const data = await otakudesu.animeByGenre(slug, page);
    return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', data });
  } catch(e) {
    return handleError(res, e);
  }
};

const jadwalRilisHandler = async (_, res) => {
    try {
        const data = await otakudesu.jadwalRilis();
        return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', data });
    } catch (e) {
        return handleError(res, e);
    }
};

const moviesHandler = async (req, res) => {
    const { page } = req.params;
    try {
        const data = await otakudesu.movies(page);
        return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', data });
    } catch (e) {
        return handleError(res, e);
    }
};

const singleMovieHandler = async (req, res) => {
    const { year, month, slug } = req.params;
    const fullSlug = `/${year}/${month}/${slug}`;
    try {
        const data = await otakudesu.movie(fullSlug);
        return res.status(200).json({ status: 'Ok', Creator: 'RioRuo', data });
    } catch (e) {
        return handleError(res, e);
    }
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
        if (format === 'json') return res.status(200).json(data);
        return res.type('text/plain').send(data);
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
        const pageNumber = page ? parseInt(page) : 1;
        const data = await otakudesu.quotes.getQuotes(pageNumber);
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", ...data });
    } catch (e) {
        return handleError(res, e);
    }
};

const quotesByTagHandler = async (req, res) => {
    try {
        const { tag, page } = req.params;
        const pageNumber = page ? parseInt(page) : 1;
        const data = await otakudesu.quotes.getQuotesByTag(tag, pageNumber);
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", ...data });
    } catch (e) {
        return handleError(res, e);
    }
};

const vgdHandler = async (req, res) => {
    try {
        const { longUrl } = req.body;
        const result = await otakudesu.vgd.shorten(longUrl);
        return res.status(201).json({ status: "Ok", Creator: "RioRuo", originalUrl: longUrl, shortUrl: result.shorturl, type: 'random' });
    } catch (e) {
        return res.status(400).json({ status: "Error", message: 'Gagal memperpendek URL.', details: e.message });
    }
};

const vgdCustomHandler = async (req, res) => {
    try {
        const { longUrl, customAlias } = req.body;
        const result = await otakudesu.vgd.shortenCustom(longUrl, customAlias);
        return res.status(201).json({ status: "Ok", Creator: "RioRuo", originalUrl: longUrl, shortUrl: result.shorturl, type: 'custom' });
    } catch (e) {
        return res.status(400).json({ status: "Error", message: 'Gagal membuat URL kustom.', details: e.message });
    }
};

const komikuMangaPageHandler = async (req, res) => {
    try {
        const { page } = req.params;
        const data = await komiku.getMangaPage(page);
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", manga_list: data });
    } catch (e) {
        return handleError(res, e);
    }
};

const komikuPopularHandler = async (req, res) => {
    try {
        const { page } = req.params;
        const data = await komiku.getPopularManga(page);
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", manga_list: data });
    } catch (e) {
        return handleError(res, e);
    }
};

const komikuDetailHandler = async (req, res) => {
    try {
        const { endpoint } = req.params;
        const data = await komiku.getMangaDetail(endpoint);
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", data });
    } catch (e) {
        return handleError(res, e);
    }
};

const komikuSearchHandler = async (req, res) => {
    try {
        const { query } = req.params;
        const data = await komiku.searchManga(query);
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", manga_list: data });
    } catch (e) {
        return handleError(res, e);
    }
};

const komikuGenreListHandler = async (req, res) => {
    try {
        const data = await komiku.getGenres();
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", list_genre: data });
    } catch (e) {
        return handleError(res, e);
    }
};

const komikuGenreDetailHandler = async (req, res) => {
    try {
        const { endpoint, page } = req.params;
        const data = await komiku.getAnimeByGenre(endpoint, page);
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", manga_list: data });
    } catch (e) {
        return handleError(res, e);
    }
};

const komikuRecommendedHandler = async (req, res) => {
    try {
        const data = await komiku.getRecommended();
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", manga_list: data });
    } catch (e) {
        return handleError(res, e);
    }
};

const komikuManhuaHandler = async (req, res) => {
    try {
        const { page } = req.params;
        const data = await komiku.getManhuaManhwa(page, 'manhua');
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", manga_list: data });
    } catch (e) {
        return handleError(res, e);
    }
};

const komikuManhwaHandler = async (req, res) => {
    try {
        const { page } = req.params;
        const data = await komiku.getManhuaManhwa(page, 'manhwa');
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", manga_list: data });
    } catch (e) {
        return handleError(res, e);
    }
};

const komikuChapterHandler = async (req, res) => {
    try {
        const { title } = req.params;
        const data = await komiku.getChapter(title);
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", data });
    } catch (e) {
        return handleError(res, e);
    }
};

const samehadakuHomeHandler = async (req, res) => {
    try {
        const { page } = req.params;
        const data = await otakudesu.samehadaku.getHome(page);
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", data });
    } catch (e) {
        return handleError(res, e);
    }
};

const samehadakuAnimeDetailHandler = async (req, res) => {
    try {
        const { slug } = req.params;
        const data = await otakudesu.samehadaku.getAnimeDetail(slug);
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", data });
    } catch (e) {
        return handleError(res, e);
    }
};

const samehadakuStreamHandler = async (req, res) => {
    try {
        const { slug } = req.params;
        const data = await otakudesu.samehadaku.getStreamDetail(slug);
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", data });
    } catch (e) {
        return handleError(res, e);
    }
};

const samehadakuSearchHandler = async (req, res) => {
    try {
        const query = req.query.s || req.query.q;
        if (!query) return res.status(400).json({ status: "Error", message: "Missing search query parameter 's'" });
        const data = await otakudesu.samehadaku.getSearch(query);
        return res.status(200).json({ status: "Ok", Creator: "RioRuo", data });
    } catch (e) {
        return handleError(res, e);
    }
};

export default {
  searchAnimeHandler,
  homeHandler,
  ongoingAnimeHandler,
  completeAnimeHandler,
  singleAnimeHandler,
  episodesHandler,
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
  samehadakuStreamHandler,
  samehadakuSearchHandler
};

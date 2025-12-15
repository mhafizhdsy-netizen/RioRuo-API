import otakudesu from '../src/otakudesu.js';

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

  return res.status(200).json({ status: 'Ok', data });
};

const homeHandler = async (_, res)  => {
  let data;
  try {
    data = await otakudesu.home();
  } catch(e) {
    return handleError(res, e);
  }

  return res.status(200).json({ status: 'Ok', data });
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
  return res.status(200).json({ status: 'Ok', data: ongoingAnimeData, pagination: paginationData });
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
  return res.status(200).json({ status: 'Ok', data: completeAnimeData, pagination: paginationData });
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
  return res.status(200).json({ status: 'Ok', data });
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
  return res.status(200).json({ status: 'Ok', data });
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
  return res.status(200).json({ status: 'Ok', data });
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
  return res.status(200).json({ status: 'Ok', data });
};

const batchByBatchSlugHandler = async (req, res) => {
  const { slug } = req.params;

  let data;
  try {
    data = await otakudesu.batch({ batchSlug: slug });
  } catch(e) {
    return handleError(res, e);
  }

  return res.status(200).json({ status: 'Ok', data });
};

const batchHandler = async (req, res) => {
  const { slug } = req.params;
  
  let data;
  try {
    data = await otakudesu.batch({ animeSlug: slug });
  } catch(e) {
    return handleError(res, e);
  }

  return data ? res.status(200).json({ status: 'Ok', data }) : res.status(404).json({
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

  return res.status(200).json({ status: 'Ok', data });
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

  return res.status(200).json({ status: 'Ok', data });
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
  animeByGenreHandler
};
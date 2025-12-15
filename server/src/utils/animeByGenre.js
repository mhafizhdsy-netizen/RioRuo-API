import axiosClient from '../lib/axiosClient.js';
import scrapeAnimeByGenre from '../lib/scrapeAnimeByGenre.js';

const BASEURL = 'https://otakudesu.best';

const animeByGenre = async (genre, page = 1) => {
  console.log('[Handler] Using Axios client for /genres/:slug');
  const response = await axiosClient.get(`${BASEURL}/genres/${genre}/page/${page}`);
  const result = scrapeAnimeByGenre(response.data);

  return result;
};

export default animeByGenre;

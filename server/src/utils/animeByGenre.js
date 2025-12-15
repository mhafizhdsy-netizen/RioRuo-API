import apiClient from '../lib/apiClient.js';
import scrapeAnimeByGenre from '../lib/scrapeAnimeByGenre.js';

const BASEURL = 'https://otakudesu.best';

const animeByGenre = async (genre, page = 1) => {
  const response = await apiClient.get(`${BASEURL}/genres/${genre}/page/${page}`);
  const result = scrapeAnimeByGenre(response.data);

  return result;
};

export default animeByGenre;
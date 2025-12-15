import apiClient from '../lib/apiClient.js';
import scrapeAnimeEpisodes from '../lib/scrapeAnimeEpisodes.js';

const BASEURL = 'https://otakudesu.best';

const episodes = async (slug) => {
  const { data } = await apiClient.get(`${BASEURL}/anime/${slug}`);
  const result = scrapeAnimeEpisodes(data);

  return result;
};

export default episodes;
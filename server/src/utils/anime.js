import apiClient from '../lib/apiClient.js';
import scrapeSingleAnime from '../lib/scrapeSingleAnime.js';

const BASEURL = 'https://otakudesu.best';

const anime = async (slug) => {
  const { data } = await apiClient.get(`${BASEURL}/anime/${slug}`);
  const result = scrapeSingleAnime(data);

  return result;
};

export default anime;
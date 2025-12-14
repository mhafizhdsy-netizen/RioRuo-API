import axios from 'axios';
import scrapeSingleAnime from '../lib/scrapeSingleAnime.js';

const BASEURL = 'https://otakudesu.best';
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Referer': BASEURL
};

const anime = async (slug) => {
  const { data } = await axios.get(`${BASEURL}/anime/${slug}`, { headers });
  const result = scrapeSingleAnime(data);

  return result;
};

export default anime;
import axios from 'axios';
import getBatch from '../lib/getBatch.js';
import scrapeBatch from '../lib/scrapeBatch.js';

const BASEURL = 'https://otakudesu.best';
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Referer': BASEURL
};

const batch = async ({ batchSlug, animeSlug }) => {
  let batch = batchSlug;

  if (animeSlug) {
    const response = await axios.get(`${BASEURL}/anime/${animeSlug}`, { headers });
    const batchData = getBatch(response.data);
    batch = batchData?.slug;
  }
  if (!batch) return false;

  const response = await axios.get(`${BASEURL}/batch/${batch}`, { headers });
  const result = scrapeBatch(response.data);

  return result;
};

export default batch;
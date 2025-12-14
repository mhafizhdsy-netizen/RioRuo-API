import axios from 'axios';
import getBatch from '../lib/getBatch.js';
import scrapeBatch from '../lib/scrapeBatch.js';

const BASEURL = 'https://otakudesu.best';
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': BASEURL,
  'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive'
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
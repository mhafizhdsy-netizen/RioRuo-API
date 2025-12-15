import apiClient from '../lib/apiClient.js';
import getBatch from '../lib/getBatch.js';
import scrapeBatch from '../lib/scrapeBatch.js';

const BASEURL = 'https://otakudesu.best';

const batch = async ({ batchSlug, animeSlug }) => {
  console.log('[Handler] Using Puppeteer client for batch endpoints');
  let batch = batchSlug;

  if (animeSlug) {
    const response = await apiClient.get(`${BASEURL}/anime/${animeSlug}`);
    const batchData = getBatch(response.data);
    batch = batchData?.slug;
  }
  if (!batch) return false;

  const response = await apiClient.get(`${BASEURL}/batch/${batch}`);
  const result = scrapeBatch(response.data);

  return result;
};

export default batch;

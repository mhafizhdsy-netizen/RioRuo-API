import axiosClient from '../lib/axiosClient.js';
import scrapesearchresult from '../lib/scrapeSearchResult.js';

const BASEURL = 'https://otakudesu.best';

const search = async (keyword) => {
  console.log('[Handler] Using Axios client for /search');
  const response = await axiosClient.get(`${BASEURL}/?s=${keyword}&post_type=anime`);
  const html = response.data;
  const searchResult = scrapesearchresult(html);
  return searchResult;
};

export default search;

import apiClient from '../lib/apiClient.js';
import scrapesearchresult from '../lib/scrapeSearchResult.js';

const BASEURL = 'https://otakudesu.best';

const search = async (keyword) => {
  const response = await apiClient.get(`${BASEURL}/?s=${keyword}&post_type=anime`);
  const html = response.data;
  const searchResult = scrapesearchresult(html);
  return searchResult;
};

export default search;
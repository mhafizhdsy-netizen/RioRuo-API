import axios from 'axios';
import scrapesearchresult from '../lib/scrapeSearchResult.js';

const BASEURL = 'https://otakudesu.is'; // Hardcoded BASEURL for scraping
const search = async (keyword) => {
  const response = await axios.get(`${BASEURL}/?s=${keyword}&post_type=anime`);
  const html = response.data;
  const searchResult = scrapesearchresult(html);
  return searchResult;
};

export default search;
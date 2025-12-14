import axios from 'axios';
import scrapeGenreLists from '../lib/scrapeGenreLists.js';

const BASEURL = 'https://otakudesu.best'; // Hardcoded BASEURL for scraping
const genreLists = async () => {
  const response = await axios.get(`${BASEURL}/genre-list`);
  const result = scrapeGenreLists(response.data);

  return result;
};

export default genreLists;
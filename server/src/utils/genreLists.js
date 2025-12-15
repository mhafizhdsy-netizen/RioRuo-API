import apiClient from '../lib/apiClient.js';
import scrapeGenreLists from '../lib/scrapeGenreLists.js';

const BASEURL = 'https://otakudesu.best';

const genreLists = async () => {
  const response = await apiClient.get(`${BASEURL}/genre-list`);
  const result = scrapeGenreLists(response.data);

  return result;
};

export default genreLists;
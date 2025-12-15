import axiosClient from '../lib/axiosClient.js';
import scrapeGenreLists from '../lib/scrapeGenreLists.js';

const BASEURL = 'https://otakudesu.best';

const genreLists = async () => {
  console.log('[Handler] Using Axios client for /genres');
  const response = await axiosClient.get(`${BASEURL}/genre-list`);
  const result = scrapeGenreLists(response.data);

  return result;
};

export default genreLists;

import axiosClient from '../lib/axiosClient.js';
import { load } from 'cheerio';
import pagination from '../lib/pagination.js';
import scrapeOngoingAnime from '../lib/scrapeOngoingAnime.js';

const BASEURL = 'https://otakudesu.best';

const ongoingAnime = async (page = 1) => {
  console.log('[Handler] Using Axios client for /ongoing-anime');
  const { data } = await axiosClient.get(`${BASEURL}/ongoing-anime/page/${page}`);
  const  $ = load(data);
  const ongoingAnimeEls = $('.venutama .rseries .rapi .venz ul li').toString();
  const ongoingAnimeData = scrapeOngoingAnime(ongoingAnimeEls);
  const paginationData =  pagination($('.pagination').toString());

  return { 
    paginationData,
    ongoingAnimeData
  };
};

export default ongoingAnime;

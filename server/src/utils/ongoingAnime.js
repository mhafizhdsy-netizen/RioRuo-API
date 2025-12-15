import apiClient from '../lib/apiClient.js';
import { load } from 'cheerio';
import pagination from '../lib/pagination.js';
import scrapeOngoingAnime from '../lib/scrapeOngoingAnime.js';

const BASEURL = 'https://otakudesu.best';

const ongoingAnime = async (page = 1) => {
  const { data } = await apiClient.get(`${BASEURL}/ongoing-anime/page/${page}`);
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
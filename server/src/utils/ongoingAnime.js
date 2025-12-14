import axios from 'axios';
import { load } from 'cheerio';
import pagination from '../lib/pagination.js';
import scrapeOngoingAnime from '../lib/scrapeOngoingAnime.js';

const BASEURL = 'https://otakudesu.best';
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Referer': BASEURL
};

const ongoingAnime = async (page = 1) => {
  const { data } = await  axios.get(`${BASEURL}/ongoing-anime/page/${page}`, { headers });
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
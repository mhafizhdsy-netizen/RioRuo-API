import axiosClient from '../lib/axiosClient.js';
import { load } from 'cheerio';
import scrapeOngoingAnime from '../lib/scrapeOngoingAnime.js';
import scrapeCompleteAnime from '../lib/scrapeCompleteAnime.js';

const BASEURL = 'https://otakudesu.best';

const home = async () => {
  console.log('[Handler] Using Axios client for /home');
  const { data } = await axiosClient.get(BASEURL);
  const $ = load(data);
  const ongoingAnimeEls = $('.venutama .rseries .rapi:first .venz ul li').toString();
  const completeAnimeEls = $('.venutama .rseries .rapi:last .venz ul li').toString();
  const ongoing_anime = scrapeOngoingAnime(ongoingAnimeEls);
  const complete_anime = scrapeCompleteAnime(completeAnimeEls);

  return {
    ongoing_anime,
    complete_anime
  };
};

export default home;

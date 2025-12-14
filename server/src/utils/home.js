import axios from 'axios';
import { load } from 'cheerio';
import scrapeOngoingAnime from '../lib/scrapeOngoingAnime.js';
import scrapeCompleteAnime from '../lib/scrapeCompleteAnime.js';

const BASEURL = 'https://otakudesu.is'; // Hardcoded BASEURL for scraping
const home = async () => {
  const { data } = await axios.get(BASEURL);
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
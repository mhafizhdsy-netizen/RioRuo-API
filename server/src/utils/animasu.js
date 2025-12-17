
import axios from 'axios';
import { load } from 'cheerio';
import {
  getCards,
  getPaginationButton,
  getPaginationCount,
  getAnimeDetails,
  getAnimeEpisode
} from '../lib/scrapeAnimasu.js';

const BASE_URL = 'https://v0.animasu.app';

// Menggunakan headers lengkap dari browser asli (Chrome Windows)
// Termasuk Cookie cf_clearance untuk bypass Cloudflare Challenge
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Cookie': 'cf_clearance=ixDtJHvJFWi2oRNKRq4WIK6TjWOh2S09raP1e3ohKGE-1765948665-1.2.1.1-VL7nEAWud17_niZrAaNWGsqX07S0wc5F3CrmCV2Qo_ewtvRBpAbwOvel.AjgpUQcqgPXIDULLbqYp4sciQdC4qpTio_XZYqpqqFpn3S93UKFfEYXtvOug8uxYHUTa8dLOxf_n1mlW70QJjzwC5Fdl5bzXjXvPNaguzvVGb6r8TqXl0nX2f4KxSiSVQR0wdSCuoFanZCs4ABZ_.BC2xACKzND6PQFxZHLtZI.9KRtTRo',
    'Referer': 'https://v0.animasu.app/',
    'Origin': 'https://v0.animasu.app',
};

const getOngoing = async (page = 1) => {
    const { data } = await axios.get(`${BASE_URL}/anime-sedang-tayang-terbaru/?halaman=${page}`, { headers: HEADERS });
    const $ = load(data);
    const anime = getCards($);
    const pagination = getPaginationButton($);
    return { anime, pagination };
};

const getDetail = async (slug) => {
    const { data } = await axios.get(`${BASE_URL}/anime/${slug}`, { headers: HEADERS });
    const $ = load(data);
    const result = getAnimeDetails($);
    return result;
};

const getEpisode = async (slug) => {
    const { data } = await axios.get(`${BASE_URL}/${slug}`, { headers: HEADERS });
    const $ = load(data);
    const result = getAnimeEpisode($);
    return result;
};

const search = async (keyword, page = 1) => {
    const { data } = await axios.get(`${BASE_URL}/page/${page}/?s=${keyword}`, { headers: HEADERS });
    const $ = load(data);
    const anime = getCards($);
    const paginationCount = getPaginationCount($);
    return { anime, paginationCount };
};

const getByGenre = async (slug, page = 1) => {
    const { data } = await axios.get(`${BASE_URL}/kumpulan-genre-anime-lengkap/${slug}/page/${page}`, { headers: HEADERS });
    const $ = load(data);
    const anime = getCards($);
    const paginationCount = getPaginationCount($);
    return { anime, paginationCount };
};

const getMovies = async (page = 1) => {
    const { data } = await axios.get(`${BASE_URL}/anime-movie/?halaman=${page}`, { headers: HEADERS });
    const $ = load(data);
    const anime = getCards($);
    const pagination = getPaginationButton($);
    return { anime, pagination };
};

export default {
    getOngoing,
    getDetail,
    getEpisode,
    search,
    getByGenre,
    getMovies
};


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

// Headers yang sangat lengkap menyerupai Browser asli (Chrome Windows)
// untuk menghindari deteksi bot sederhana atau WAF Cloudflare level rendah.
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://v0.animasu.app/',
    'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive'
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
    // Search URL pattern based on provided text
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

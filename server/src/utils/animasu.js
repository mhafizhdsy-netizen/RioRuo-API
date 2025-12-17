
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

// Headers disamakan dengan konfigurasi Otakudesu (utils/search.js)
const HEADERS = {
    "Accept": "*/*",
    "Accept-Encoding": "deflate, gzip",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
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

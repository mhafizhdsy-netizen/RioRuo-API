
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

// Menggunakan headers yang lebih lengkap menyerupai browser dan prioritas bahasa Indonesia
const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1"
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

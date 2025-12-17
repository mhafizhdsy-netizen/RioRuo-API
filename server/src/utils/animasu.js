
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

// Headers yang disesuaikan agar mirip dengan browser (Chrome Windows)
// Menggunakan axios seperti request user.
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br', // Axios handle decompression, but header helps server know we support it
    'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
    'Referer': 'https://v0.animasu.app/',
    'Origin': 'https://v0.animasu.app',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
};

const fetchHtml = async (url) => {
    try {
        const { data } = await axios.get(url, { 
            headers: HEADERS,
            timeout: 10000 // 10s timeout
        });
        return data;
    } catch (error) {
        console.error(`[Animasu] Error fetching ${url}:`, error.message);
        // Jika error response (misal 403/503), lempar error agar handler di atas bisa menangkapnya
        throw error;
    }
};

const getOngoing = async (page = 1) => {
    const html = await fetchHtml(`${BASE_URL}/anime-sedang-tayang-terbaru/?halaman=${page}`);
    const $ = load(html);
    const anime = getCards($);
    const pagination = getPaginationButton($);
    return { anime, pagination };
};

const getDetail = async (slug) => {
    const html = await fetchHtml(`${BASE_URL}/anime/${slug}`);
    const $ = load(html);
    const result = getAnimeDetails($);
    return result;
};

const getEpisode = async (slug) => {
    const html = await fetchHtml(`${BASE_URL}/${slug}`);
    const $ = load(html);
    const result = getAnimeEpisode($);
    return result;
};

const search = async (keyword, page = 1) => {
    const html = await fetchHtml(`${BASE_URL}/page/${page}/?s=${keyword}`);
    const $ = load(html);
    const anime = getCards($);
    const paginationCount = getPaginationCount($);
    return { anime, paginationCount };
};

const getByGenre = async (slug, page = 1) => {
    const html = await fetchHtml(`${BASE_URL}/kumpulan-genre-anime-lengkap/${slug}/page/${page}`);
    const $ = load(html);
    const anime = getCards($);
    const paginationCount = getPaginationCount($);
    return { anime, paginationCount };
};

const getMovies = async (page = 1) => {
    const html = await fetchHtml(`${BASE_URL}/anime-movie/?halaman=${page}`);
    const $ = load(html);
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

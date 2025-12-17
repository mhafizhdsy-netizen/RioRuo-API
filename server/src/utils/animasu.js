
import { load } from 'cheerio';
import {
  getCards,
  getPaginationButton,
  getPaginationCount,
  getAnimeDetails,
  getAnimeEpisode
} from '../lib/scrapeAnimasu.js';

const BASE_URL = 'https://v0.animasu.app';

// Helper function menggunakan fetch standar TAPI WAJIB pakai User-Agent
// Tanpa User-Agent, website akan memblokir request (return 403 atau halaman kosong)
const fetchHtml = async (url) => {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        if (!response.ok) {
            throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`[Animasu] Error fetching ${url}:`, error.message);
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

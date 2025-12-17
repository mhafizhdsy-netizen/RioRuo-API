
import { load } from 'cheerio';
import {
  getCards,
  getPaginationButton,
  getPaginationCount,
  getAnimeDetails,
  getAnimeEpisode
} from '../lib/scrapeAnimasu.js';

const BASE_URL = 'https://v0.animasu.app';

// Headers lengkap sesuai permintaan user
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

// Helper function untuk fetch data (menggantikan axios)
// Mendukung ScraperAPI jika API Key tersedia di env
const fetchHtml = async (targetUrl) => {
    let urlToFetch = targetUrl;
    const fetchOptions = {
        method: 'GET',
        headers: HEADERS
    };

    // Integrasi ScraperAPI
    // Jika SCRAPERAPI_KEY ada di .env, gunakan proxy service
    if (process.env.SCRAPERAPI_KEY) {
        const apiKey = process.env.SCRAPERAPI_KEY;
        // Construct URL ScraperAPI
        // keep_headers=true memastikan headers khusus kita (seperti bhs Indonesia) diteruskan
        const params = new URLSearchParams({
            api_key: apiKey,
            url: targetUrl,
            keep_headers: 'true' 
        });
        urlToFetch = `http://api.scraperapi.com?${params.toString()}`;
    }

    try {
        const response = await fetch(urlToFetch, fetchOptions);
        
        if (!response.ok) {
            throw new Error(`Fetch failed with status: ${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        return text;
    } catch (error) {
        console.error(`[Animasu Fetch Error] URL: ${targetUrl} | ScraperAPI: ${!!process.env.SCRAPERAPI_KEY}`, error.message);
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

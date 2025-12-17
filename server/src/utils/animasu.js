
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
const PROXY_LIST_URL = "https://api.proxyscrape.com/v4/free-proxy-list/get?request=displayproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all&skip=0&limit=2000";

// Headers lengkap sesuai permintaan
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

// Global variables untuk caching proxy list
let proxyList = [];
let lastProxyUpdate = 0;

// Fungsi untuk memperbarui daftar proxy (Cache 10 menit)
const updateProxyList = async () => {
    // Jika list ada dan umur cache kurang dari 10 menit, gunakan cache
    if (proxyList.length > 0 && (Date.now() - lastProxyUpdate) < 1000 * 60 * 10) {
        return;
    }
    try {
        console.log("[Animasu] Updating proxy list from ProxyScrape...");
        // Gunakan axios tanpa proxy untuk mengambil list proxy
        const { data } = await axios.get(PROXY_LIST_URL); 
        if (typeof data === 'string') {
            // Normalize line endings and split
            proxyList = data.replace(/\r\n/g, '\n').split('\n').filter(p => p.trim() !== '');
            console.log(`[Animasu] Updated: Got ${proxyList.length} proxies.`);
            lastProxyUpdate = Date.now();
        }
    } catch (e) {
        console.error("[Animasu] Failed to update proxy list:", e.message);
        // Jangan kosongkan list jika gagal update, gunakan yang lama jika ada
    }
};

// Helper function untuk fetch data dengan rotasi proxy (Axios)
const fetchHtml = async (targetUrl) => {
    await updateProxyList();
    
    // Jika tidak ada proxy sama sekali, fallback ke direct connection
    if (proxyList.length === 0) {
        console.warn("[Animasu] No proxies available. Using direct connection.");
        const { data } = await axios.get(targetUrl, { headers: HEADERS });
        return data;
    }

    const maxRetries = 10; // Coba hingga 10 proxy berbeda
    let attempts = 0;
    
    while (attempts < maxRetries) {
        // Pick random proxy dari list setiap request
        const randomIndex = Math.floor(Math.random() * proxyList.length);
        const proxyUrl = proxyList[randomIndex];
        
        let axiosConfig = {
            headers: HEADERS,
            timeout: 5000, // Timeout pendek (5s) agar rotasi cepat jika proxy lambat/mati
            validateStatus: (status) => status < 500 // Accept 4xx temporarily to check content
        };

        // Konfigurasi Proxy untuk Axios
        if (proxyUrl) {
            const [host, port] = proxyUrl.split(':');
            if (host && port) {
                axiosConfig.proxy = {
                    protocol: 'http',
                    host: host,
                    port: parseInt(port),
                };
            }
        }

        try {
            // console.log(`[Animasu] Fetching ${targetUrl} via ${proxyUrl} (Attempt ${attempts + 1})`);
            
            const { data, status } = await axios.get(targetUrl, axiosConfig);
            
            // Validasi response: Pastikan status 200 dan isi adalah HTML string
            // Cloudflare sering return 403 atau 503, atau halaman challenge
            if (status === 200 && typeof data === 'string' && !data.includes('Attention Required! | Cloudflare')) {
                return data;
            } else {
                throw new Error(`Invalid status ${status} or Cloudflare challenge`);
            }

        } catch (error) {
            attempts++;
            // Hapus proxy yang gagal dari list lokal sementara (opsional, tapi bagus untuk efisiensi)
            // Namun karena kita pick random, biarkan saja untuk kesederhanaan
            
            if (attempts >= maxRetries) {
                console.error(`[Animasu] Failed after ${maxRetries} proxy attempts.`);
                throw new Error("Failed to fetch data using proxies.");
            }
        }
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

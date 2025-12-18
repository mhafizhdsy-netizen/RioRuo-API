
import axios from 'axios';
import { load } from 'cheerio';
import { scrapeHomePage, scrapeAnimeDetail } from '../lib/scrapeSamehadaku.js';
import scrapeSamehadakuStream from '../lib/scrapeSamehadakuStream.js';

// Base URL for Samehadaku - adjust as needed if domain changes
const BASEURL = process.env.SAMEHADAKU_URL || 'https://samehadaku.li'; 

// Headers to mimic a real browser request
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
};

const getHome = async (page = 1) => {
    try {
        const url = page && page > 1 ? `${BASEURL}/page/${page}` : BASEURL;
        const { data } = await axios.get(url, { 
            headers: HEADERS,
            timeout: 120000 
        });
        const result = scrapeHomePage(data);
        return result;
    } catch (error) {
        console.error(`[Samehadaku] Error fetching home page ${page}: ${error.message}`);
        throw error;
    }
};

const getAnimeDetail = async (slug) => {
    try {
        const url = `${BASEURL}/anime/${slug}`;
        const { data } = await axios.get(url, {
            headers: HEADERS,
            timeout: 120000
        });
        const $ = load(data);
        const result = scrapeAnimeDetail($);
        return result;
    } catch (error) {
        console.error(`[Samehadaku] Error fetching anime detail ${slug}: ${error.message}`);
        throw error;
    }
};

const getStreamDetail = async (slug) => {
    try {
        const url = `${BASEURL}/${slug}`;
        const { data } = await axios.get(url, {
            headers: HEADERS,
            timeout: 120000
        });
        const result = scrapeSamehadakuStream(data);
        return result;
    } catch (error) {
        console.error(`[Samehadaku] Error fetching stream detail ${slug}: ${error.message}`);
        throw error;
    }
};

export default {
    getHome,
    getAnimeDetail,
    getStreamDetail
};

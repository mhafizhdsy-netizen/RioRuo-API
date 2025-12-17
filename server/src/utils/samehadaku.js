
import axios from 'axios';
import { scrapeHomePage } from '../lib/scrapeSamehadaku.js';

// Base URL for Samehadaku - adjust as needed if domain changes
const BASEURL = process.env.SAMEHADAKU_URL || 'https://samehadaku.li'; 

// Headers to mimic a real browser request
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
};

const getHome = async () => {
    try {
        const { data } = await axios.get(BASEURL, { headers: HEADERS });
        const result = scrapeHomePage(data);
        return result;
    } catch (error) {
        console.error(`[Samehadaku] Error fetching home: ${error.message}`);
        throw error;
    }
};

export default {
    getHome
};

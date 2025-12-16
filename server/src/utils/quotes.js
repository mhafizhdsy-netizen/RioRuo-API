
import axios from 'axios';
import scrapeQuotes from '../lib/scrapeQuotes.js';

const BASE_URL = 'https://www.goodreads.com';

// Goodreads membutuhkan User-Agent agar tidak memblokir request.
// Menambahkan Accept header untuk meniru browser lebih baik.
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
};

const getQuotes = async (page = 1) => {
    const url = `${BASE_URL}/quotes?page=${page}`;
    try {
        const { data } = await axios.get(url, { headers: HEADERS });
        const quotes = scrapeQuotes(data);
        return {
            page: parseInt(page),
            source: url,
            quotes
        };
    } catch (error) {
        // Log URL that failed for debugging
        console.error(`Failed to fetch quotes from: ${url}`);
        throw error;
    }
};

const getQuotesByTag = async (tag, page = 1) => {
    // Encode tag to handle spaces or special characters safely
    const encodedTag = encodeURIComponent(tag);
    const url = `${BASE_URL}/quotes/tag/${encodedTag}?page=${page}`;
    try {
        const { data } = await axios.get(url, { headers: HEADERS });
        const quotes = scrapeQuotes(data);
        return {
            tag,
            page: parseInt(page),
            source: url,
            quotes
        };
    } catch (error) {
        console.error(`Failed to fetch quotes by tag from: ${url}`);
        throw error;
    }
};

export default {
    getQuotes,
    getQuotesByTag
};

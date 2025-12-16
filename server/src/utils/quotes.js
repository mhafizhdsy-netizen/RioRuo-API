
import axios from 'axios';
import scrapeQuotes from '../lib/scrapeQuotes.js';

const BASE_URL = 'https://www.goodreads.com';

// Goodreads membutuhkan User-Agent agar tidak memblokir request
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
        throw error;
    }
};

export default {
    getQuotes,
    getQuotesByTag
};

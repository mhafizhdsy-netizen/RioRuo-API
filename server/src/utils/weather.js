
import axios from 'axios';

const WTTR_BASE_URL = 'https://wttr.in';
const TIMEOUT = 60000; // Increased to 60 seconds to mitigate slow upstream responses

// Helper function to retry requests on failure
const fetchWithRetry = async (url, config, retries = 2) => {
    try {
        return await axios.get(url, config);
    } catch (error) {
        // Retry if timeout (ECONNABORTED) or server error (5xx)
        if (retries > 0 && (error.code === 'ECONNABORTED' || (error.response && error.response.status >= 500))) {
            console.warn(`[Weather Utils] Request failed for ${url}. Retrying... (${retries} attempts left)`);
            return await fetchWithRetry(url, config, retries - 1);
        }
        throw error;
    }
};

const getWeather = async (location, lang = 'en') => {
    // Panggil endpoint wttr.in dengan format JSON
    const url = `${WTTR_BASE_URL}/${encodeURIComponent(location)}?format=j1&lang=${lang}`;
    const response = await fetchWithRetry(url, {
        timeout: TIMEOUT,
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    });
    return {
        success: true,
        source: 'wttr.in',
        location: location,
        data: response.data
    };
};

const getWeatherAscii = async (location, lang = 'en', format) => {
    // Panggil wttr.in tanpa format khusus untuk mendapat ASCII art
    const url = `${WTTR_BASE_URL}/${encodeURIComponent(location)}?lang=${lang}`;
    const response = await fetchWithRetry(url, {
        timeout: TIMEOUT,
        headers: {
            'User-Agent': 'curl/7.68.0' // wttr.in mendeteksi curl untuk ASCII output
        }
    });

    if (format === 'json') {
        return {
            success: true,
            source: 'wttr.in',
            location: location,
            ascii_art: response.data
        };
    }
    
    return response.data;
};

const getWeatherQuick = async (location, lang = 'en') => {
    // Format wajib wttr.in: %l:+%C+%t+%h+%w
    const format = '%l:+%C+%t+%h+%w';
    const url = `${WTTR_BASE_URL}/${encodeURIComponent(location)}?format=${encodeURIComponent(format)}&lang=${lang}`;

    const response = await fetchWithRetry(url, {
        timeout: TIMEOUT,
        headers: {
            'User-Agent': 'curl/7.68.0'
        }
    });

    return {
        success: true,
        source: 'wttr.in',
        location: location,
        weather: response.data.trim()
    };
};

const getWeatherPng = async (location) => {
    // wttr.in menyediakan gambar PNG
    const url = `${WTTR_BASE_URL}/${encodeURIComponent(location)}.png`;
    const response = await fetchWithRetry(url, {
        responseType: 'arraybuffer',
        timeout: TIMEOUT,
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    });
    return response.data;
};

export default {
    getWeather,
    getWeatherAscii,
    getWeatherQuick,
    getWeatherPng
};

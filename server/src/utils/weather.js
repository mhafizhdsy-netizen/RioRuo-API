
import axios from 'axios';

const WTTR_BASE_URL = 'https://wttr.in';

const getWeather = async (location, lang = 'en') => {
    // Panggil endpoint wttr.in dengan format JSON
    const url = `${WTTR_BASE_URL}/${encodeURIComponent(location)}?format=j1&lang=${lang}`;
    const response = await axios.get(url, {
        timeout: 10000,
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
    const response = await axios.get(url, {
        timeout: 10000,
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

const getWeatherQuick = async (location, lang = 'en', customFormat) => {
    // Format custom wttr.in:
    // %l = location, %C = weather condition, %t = temperature
    // %h = humidity, %w = wind, %p = precipitation
    const format = customFormat || '%l:+%C+%t+%h+%w';
    const url = `${WTTR_BASE_URL}/${encodeURIComponent(location)}?format=${encodeURIComponent(format)}&lang=${lang}`;

    const response = await axios.get(url, {
        timeout: 10000,
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
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000,
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

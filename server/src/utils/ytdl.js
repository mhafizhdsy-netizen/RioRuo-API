
import axios from 'axios';

const WORKER_URL = 'https://ytrioruoapi.mhafizhdsy.workers.dev';

// Standard headers to bypass basic bot detection and satisfy upstream security requirements
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
    'Referer': 'https://rioruo.vercel.app/',
    'Origin': 'https://rioruo.vercel.app',
    'X-Requested-With': 'XMLHttpRequest'
};

const getInfo = async (url) => {
    try {
        const response = await axios.get(`${WORKER_URL}/info`, {
            params: { url },
            headers: HEADERS,
            timeout: 60000 
        });
        return response.data;
    } catch (error) {
        console.error(`[YTDL Utils] Info Error:`, error.message);
        const upstreamMessage = error.response?.data?.message || error.response?.data?.error;
        throw new Error(upstreamMessage || 'Gagal mengambil informasi video YouTube dari server utama.');
    }
};

const getDownload = async (url, format, quality) => {
    try {
        const response = await axios.get(`${WORKER_URL}/download`, {
            params: { 
                url, 
                format: format.toLowerCase(), 
                quality: quality.toUpperCase() 
            },
            headers: HEADERS,
            timeout: 90000 // Increased to 90s for heavy processing
        });
        
        if (response.data && response.data.status === 'error') {
            throw new Error(response.data.message || 'Worker returned error status.');
        }

        return response.data;
    } catch (error) {
        console.error(`[YTDL Utils] Download Error:`, error.message);
        
        if (error.code === 'ECONNABORTED') {
            throw new Error('Permintaan ke server YouTube API terlalu lama (Timeout). Silakan coba lagi.');
        }

        const upstreamMessage = error.response?.data?.message || error.response?.data?.error;
        
        // Handle Cloudflare specific errors
        if (error.response?.status === 403) {
            throw new Error('Akses ke YouTube API ditolak oleh sistem keamanan upstream. Silakan coba beberapa saat lagi.');
        }

        throw new Error(upstreamMessage || 'Gagal membuat link download YouTube. Pastikan URL benar atau coba kualitas lain.');
    }
};

export default {
    getInfo,
    getDownload
};

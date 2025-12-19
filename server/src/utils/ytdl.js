
import axios from 'axios';
import crypto from 'crypto';

// Node.js implementation of Web Crypto Subtle API
const subtle = crypto.webcrypto.subtle;

const SECRET_KEY_HEX = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
const USER_AGENT = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36';

/**
 * Extract YouTube Video ID from various URL formats
 */
function getYouTubeVideoId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|v\/|embed\/|user\/[^\/\n\s]+\/)?(?:watch\?v=|v%3D|embed%2F|video%2F)?|youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtube\.com\/playlist\?list=)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

/**
 * Decrypts encrypted data from API response using AES-CBC
 * Implemented exactly as in the provided reference
 */
async function decode(enc) {
    try {
        // Convert base64 to Uint8Array
        const data = Buffer.from(enc, 'base64');

        // Extract IV (first 16 bytes) and content
        const iv = data.slice(0, 16);
        const content = data.slice(16);

        // Convert hex key to bytes
        const keyData = Buffer.from(SECRET_KEY_HEX, 'hex');

        // Import key for subtle crypto
        const key = await subtle.importKey(
            'raw',
            keyData,
            { name: 'AES-CBC', length: 128 },
            false,
            ['decrypt']
        );

        // Decrypt using Web Crypto API
        const decrypted = await subtle.decrypt(
            { name: 'AES-CBC', iv: iv },
            key,
            content
        );

        // Convert to string and parse JSON
        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(decrypted));
    } catch (error) {
        throw new Error('Decryption failed: ' + error.message);
    }
}

/**
 * Gets a random CDN from the provider
 */
async function getRandomCDN() {
    try {
        const response = await axios.get('https://media.savetube.me/api/random-cdn');
        return response.data.cdn;
    } catch (error) {
        throw new Error('Failed to fetch CDN: ' + error.message);
    }
}

const getInfo = async (url) => {
    try {
        const videoId = getYouTubeVideoId(url);
        if (!videoId) throw new Error('Invalid YouTube URL');

        const cdn = await getRandomCDN();
        const videoUrl = `https://youtube.com/watch?v=${videoId}`;

        // Get video info
        const infoResponse = await axios.post(`https://${cdn}/v2/info`, 
            { url: videoUrl },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': USER_AGENT,
                    'Referer': 'https://yt.savetube.me/'
                }
            }
        );

        if (!infoResponse.data || !infoResponse.data.data) {
            throw new Error('No data in info response');
        }

        const info = await decode(infoResponse.data.data);

        return {
            status: true,
            videoId: videoId,
            title: info.title,
            duration: info.duration,
            thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            availableFormats: {
                audio: [92, 128, 256, 320],
                video: [144, 360, 480, 720, 1080]
            }
        };
    } catch (error) {
        console.error(`[YTDL Utils] Info Error:`, error.message);
        throw new Error(error.message || 'Gagal mengambil informasi video YouTube.');
    }
};

const getDownload = async (url, format, quality) => {
    try {
        const videoId = getYouTubeVideoId(url);
        if (!videoId) throw new Error('Invalid YouTube URL');

        const cdn = await getRandomCDN();
        const videoUrl = `https://youtube.com/watch?v=${videoId}`;

        // 1. Get info first to get the necessary security key
        const infoResponse = await axios.post(`https://${cdn}/v2/info`, 
            { url: videoUrl },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': USER_AGENT,
                    'Referer': 'https://yt.savetube.me/'
                }
            }
        );

        if (!infoResponse.data || !infoResponse.data.data) {
            throw new Error('Failed to get video context for download.');
        }

        const info = await decode(infoResponse.data.data);

        // 2. Prepare quality value (numeric string)
        // Convert "720P" to "720", "128K" to "128"
        const cleanQuality = quality.replace(/[^\d]/g, '');

        // 3. Request download link
        const downloadResponse = await axios.post(`https://${cdn}/download`, 
            {
                downloadType: format.toLowerCase(), // 'video' or 'audio'
                quality: cleanQuality,
                key: info.key
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': USER_AGENT,
                    'Referer': 'https://yt.savetube.me/start-download'
                }
            }
        );

        const downloadData = downloadResponse.data;

        if (!downloadData || !downloadData.data) {
            throw new Error('Invalid download response from server.');
        }

        const downloadUrl = downloadData.data.downloadUrl || downloadData.data.url;

        if (!downloadUrl) {
            throw new Error('Download URL not found in response.');
        }

        return {
            status: true,
            quality: `${cleanQuality}${format === 'audio' ? 'kbps' : 'p'}`,
            downloadUrl: downloadUrl,
            filename: `${info.title} (${cleanQuality}${format === 'audio' ? 'kbps).mp3' : 'p).mp4'})`,
            availableQualities: format === 'audio' ? [92, 128, 256, 320] : [144, 360, 480, 720, 1080]
        };

    } catch (error) {
        console.error(`[YTDL Utils] Download Error:`, error.message);
        throw new Error(error.message || 'Gagal membuat link download YouTube.');
    }
};

export default {
    getInfo,
    getDownload
};

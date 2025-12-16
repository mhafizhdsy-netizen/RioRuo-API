
import axios from 'axios';

const shorten = async (url) => {
    try {
        const vgdApiUrl = `https://v.gd/create.php?format=json&url=${encodeURIComponent(url)}`;
        const response = await axios.get(vgdApiUrl);
        return response.data;
    } catch (error) {
        // v.gd returns errors in JSON format even on 400s usually, but axios throws.
        if (error.response && error.response.data) {
            throw new Error(error.response.data.error || 'Failed to shorten URL');
        }
        throw error;
    }
};

const shortenCustom = async (url, alias) => {
    try {
        const vgdApiUrl = `https://v.gd/create.php?format=json&url=${encodeURIComponent(url)}&shorturl=${encodeURIComponent(alias)}`;
        const response = await axios.get(vgdApiUrl);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            throw new Error(error.response.data.error || 'Failed to create custom alias');
        }
        throw error;
    }
};

export default {
    shorten,
    shortenCustom
};

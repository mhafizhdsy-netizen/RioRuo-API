
import axios from 'axios';

const WORKER_URL = 'https://ytrioruoapi.mhafizhdsy.workers.dev';

const getInfo = async (url) => {
    try {
        const response = await axios.get(`${WORKER_URL}/info`, {
            params: { url },
            timeout: 50000
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Gagal mengambil informasi video YouTube.');
    }
};

const getDownload = async (url, format, quality) => {
    try {
        const response = await axios.get(`${WORKER_URL}/download`, {
            params: { url, format, quality },
            timeout: 50000
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Gagal membuat link download YouTube.');
    }
};

export default {
    getInfo,
    getDownload
};

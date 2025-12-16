
import axios from 'axios';

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

const shorten = async (url) => {
    try {
        const response = await axios.get('https://v.gd/create.php', {
            params: {
                format: 'json',
                url: url,
                logstats: 0
            },
            headers: HEADERS,
            timeout: 10000 // 10s timeout
        });
        
        if (typeof response.data !== 'object') {
             // Sometimes it returns raw text or HTML on error
             throw new Error('Upstream provider returned invalid response (possibly blocked).');
        }

        if (response.data.errorcode) {
            throw new Error(response.data.errormessage || 'Error from v.gd');
        }

        return { status: 'ok', ...response.data };
    } catch (error) {
        if (error.response && error.response.data) {
            // v.gd sends errors in the body sometimes even with error codes
            const msg = error.response.data.errormessage || error.response.data.error || 'Failed to shorten URL';
            throw new Error(msg);
        }
        throw new Error(error.message || 'Unknown error during shortening');
    }
};

const shortenCustom = async (url, alias) => {
    try {
        const response = await axios.get('https://v.gd/create.php', {
            params: {
                format: 'json',
                url: url,
                shorturl: alias,
                logstats: 0
            },
            headers: HEADERS,
            timeout: 10000 // 10s timeout
        });

        if (typeof response.data !== 'object') {
             throw new Error('Upstream provider returned invalid response (possibly blocked).');
        }

        if (response.data.errorcode) {
             // Map common error codes if necessary, or just pass message
             throw new Error(response.data.errormessage || 'Error from v.gd');
        }

        return { status: 'ok', ...response.data };
    } catch (error) {
        if (error.response && error.response.data) {
             const msg = error.response.data.errormessage || error.response.data.error || 'Failed to create custom alias';
             throw new Error(msg);
        }
        throw new Error(error.message || 'Unknown error during custom shortening');
    }
};

export default {
    shorten,
    shortenCustom
};

import axios from 'axios';

// Define a list of realistic User-Agents to rotate
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
];

const axiosClient = {
  /**
   * Fetches HTML content using axios with realistic headers.
   * @param {string} url The URL to fetch.
   * @returns {Promise<{data: string, status: number, headers: object}>}
   */
  get: async (url) => {
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const headers = {
      'User-Agent': userAgent,
      'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    };
    
    console.log(`[AxiosClient] Making lightweight request to ${url}`);
    
    try {
      const response = await axios.get(url, { headers, timeout: 15000 });
      return {
        data: response.data,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      console.error(`[AxiosClient] Error fetching ${url}:`, error.message);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw { 
          response: { status: error.response.status },
          message: error.message 
        };
      } else if (error.request) {
        // The request was made but no response was received
        throw { 
          response: { status: 503 }, // Service Unavailable
          message: 'No response received from server.' 
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        throw { 
          response: { status: 500 },
          message: error.message 
        };
      }
    }
  }
};

export default axiosClient;

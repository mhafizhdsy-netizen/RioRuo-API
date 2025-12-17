
import axios from "axios";
import { baseUrl } from "../constants/urls.js";

// DO NOT set global defaults here, it affects other modules (like Animasu)
// axios.defaults.baseURL = baseUrl; 

const AxiosService = async (url) => {
  return new Promise(async (resolve, reject) => {
    const _url = url == null ? url : encodeURI(url);
    
    // Config specifically for Komiku requests
    const config = {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        }
    };

    // Only apply baseURL if the URL is relative
    if (_url && !_url.startsWith('http')) {
        config.baseURL = baseUrl;
    }

    try {
      const response = await axios.get(_url, config);
      if (response.status === 200) {
        return resolve(response);
      }
      return reject(response);
    } catch (error) {
      return reject(error.message);
    }
  });
};

export default AxiosService;

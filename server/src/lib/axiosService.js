
import axios from "axios";
import { baseUrl } from "../constants/urls.js";

// Note: axios-cookiejar-support removed as it is not in package.json dependencies
// Using standard axios instance with headers mimicking a browser

axios.defaults.baseURL = baseUrl;

const AxiosService = async (url) => {
  return new Promise(async (resolve, reject) => {
    const _url = url == null ? url : encodeURI(url);
    try {
      const response = await axios.get(_url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        }
      });
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

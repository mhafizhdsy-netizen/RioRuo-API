import axios from 'axios';
import scrapeJadwalRilis from '../lib/scrapeJadwalRilis.js';

const BASEURL = process.env.BASEURL || 'https://otakudesu.best';

const jadwalRilis = async () => {
    const { data } = await axios.get(`${BASEURL}/jadwal-rilis`);
    const result = scrapeJadwalRilis(data);
    return result;
};

export default jadwalRilis;

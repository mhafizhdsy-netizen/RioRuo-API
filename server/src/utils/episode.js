import axios from 'axios';
import episodes from './episodes.js';
import scrapeEpisode from '../lib/scrapeEpisode.js';

const BASEURL = 'https://otakudesu.best';
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Referer': BASEURL
};

const episode = async ({ episodeSlug, animeSlug, episodeNumber }) => {
  let slug = '';

  if (episodeSlug) slug = episodeSlug;
  if (animeSlug && episodeNumber) {
    const episodeLists = await episodes(animeSlug);
    if (!episodeLists) return undefined;

    const splittedEpisodeSlug = episodeLists[0].slug?.split('-episode-') ;
    const prefixEpisodeSlug = splittedEpisodeSlug[0];
    const firstEpisodeNumber = splittedEpisodeSlug[1].replace('-sub-indo', '');

    slug = `${prefixEpisodeSlug}-episode-${episodeNumber - (parseInt(firstEpisodeNumber) == 0 ? 1 : 0)}-sub-indo`;
  }

  const { data } = await axios.get(`${BASEURL}/episode/${slug}`, { headers });
  const result = scrapeEpisode(data);

  return result;
};

export default episode;
import axios from 'axios';
import episodes from './episodes.js';
import scrapeEpisode from '../lib/scrapeEpisode.js';

const BASEURL = 'https://otakudesu.best'; // Hardcoded BASEURL for scraping
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

  const { data } = await axios.get(`${BASEURL}/episode/${slug}`);
  const result = scrapeEpisode(data); // Removed BASEURL argument as it's now internal to scrapeEpisode

  return result;
};

export default episode;
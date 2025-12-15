import apiClient from '../lib/apiClient.js';
import episodes from './episodes.js';
import scrapeEpisode from '../lib/scrapeEpisode.js';

const BASEURL = 'https://otakudesu.best';

const episode = async ({ episodeSlug, animeSlug, episodeNumber }) => {
  console.log('[Handler] Using Puppeteer client for episode endpoints');
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

  const { data } = await apiClient.get(`${BASEURL}/episode/${slug}`);
  const result = scrapeEpisode(data);

  return result;
};

export default episode;

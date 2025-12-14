import { load } from 'cheerio';

const BASEURL = 'https://otakudesu.is'; // Hardcoded BASEURL for scraping
const scrapeEpisode = (html) => {
  const $ = load(html);
  const episode = getEpisodeTitle($);
  const stream_url = getStreamUrl($);
  const download_urls = createDownloadData($);
  const previous_episode = getPrevEpisode($);
  const next_episode = getNextEpisode($);
  const anime = getAnimeData($);
  
  if (!episode) return undefined;

  return {
    episode,
    anime,
    has_next_episode: next_episode ? true : false,
    next_episode,
    has_previous_episode: previous_episode ? true : false,
    previous_episode,
    stream_url,
    download_urls,
  };
};

const getEpisodeTitle = ($) => {
  return $('.venutama .posttl').text();
};

const getStreamUrl = ($) => {
  return $('#pembed iframe').attr('src');
};

const createDownloadData = ($) => {
  const mp4 = getMp4DownloadUrls($);
  const mkv = getMkvDownloadUrls($);
  return {
    mp4,
    mkv,
  };
};

const getMp4DownloadUrls = ($) => {
  const result = [];
  const mp4DownloadEls = $('.download ul:first li')
    .toString()
    .split('</li>')
    .filter((item) => item.trim() !== '')
    .map((item) => `${item}</li>`);

  for (const el of mp4DownloadEls) {
    const $ = load(el);
    const downloadUrls = $('a')
      .toString()
      .split('</a>')
      .filter((item) => item.trim() !== '')
      .map((item) => `${item}</a>`);
    const urls = [];

    for (const downloadUrl of downloadUrls) {
      const $ = load(downloadUrl);
      urls.push({
        provider: $('a').text(),
        url: $('a').attr('href'),
      });
    }
    result.push({
      resolution: $('strong').text()?.replace(/([A-z][A-z][0-9] )/, ''),
      urls,
    });
  }

  return result;
};

const getMkvDownloadUrls = ($) => {
  const result = [];
  const mp4DownloadEls = $('.download ul:last li')
    .toString()
    .split('</li>')
    .filter((item) => item.trim() !== '')
    .map((item) => `${item}</li>`);

  for (const el of mp4DownloadEls) {
    const $ = load(el);
    const downloadUrls = $('a')
      .toString()
      .split('</a>')
      .filter((item) => item.trim() !== '')
      .map((item) => `${item}</a>`);
    const urls = [];

    for (const url of downloadUrls) {
      const $ = load(url);
      urls.push({
        provider: $('a').text(),
        url: $('a').attr('href'),
      });
    }
    result.push({
      resolution: $('strong').text()?.replace(/([A-z][A-z][A-z] )/, ''),
      urls,
    });
  }

  return result;
};

const getPrevEpisode = ($) => {
  if (!$('.flir a:first').attr('href')?.startsWith(`${BASEURL}/episode/`)) return null;

  return {
    slug: $('.flir a:first').attr('href')?.replace(`${BASEURL}/episode/`, ''), // Updated regex for otakudesu.is
    otakudesu_url: $('.flir a:first').attr('href'),
  };
};

const getNextEpisode = ($) => {
  if (!$('.flir a:last').attr('href')?.startsWith(`${BASEURL}/episode/`)) return null;

  return {
    slug: $('.flir a:last').attr('href')?.replace(`${BASEURL}/episode/`, ''), // Updated regex for otakudesu.is
    otakudesu_url: $('.flir a:last').attr('href'),
  };
};

const getAnimeData = ($) => {
  // Assuming the anime link is consistently at nth-child(2) or (3) for the parent anime page
  // The logic here seems to check for empty text which might indicate the position
  const animeLinkElement = $('.flir a:nth-child(2)');
  const animeUrl = animeLinkElement.attr('href');

  if (!animeUrl?.startsWith(`${BASEURL}/anime/`)) {
    // Fallback if the expected link is not for anime or at the wrong position, try first
    const firstLink = $('.flir a:first').attr('href');
    if (firstLink?.startsWith(`${BASEURL}/anime/`)) {
      return {
        slug: firstLink?.replace(`${BASEURL}/anime/`, ''),
        otakudesu_url: firstLink,
      };
    }
    return null; // Or handle as error
  }

  return {
    slug: animeUrl?.replace(`${BASEURL}/anime/`, ''), // Updated regex for otakudesu.is
    otakudesu_url: animeUrl,
  };
};

export default scrapeEpisode;
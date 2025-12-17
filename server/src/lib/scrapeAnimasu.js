
import { load } from 'cheerio';

const BASE_URL = 'https://v0.animasu.app';

export const getCards = ($) => {
  const cards = [];

  $('.listupd .bs').each((index, element) => {
    const el = $(element);
    const title = el.find('div.bsx div.tt').text().trim(); // name -> title
    const slug = el.find('div.bsx a').attr('href')?.split('/')[4];
    const type = el.find('div.bsx a div.limit div.typez').text().trim();
    const episode = el.find('div.bsx a div.limit div.bt span.epx').text().trim();
    const poster = el.find('div.bsx a div.limit img.lazy').attr('data-src'); // img -> poster
    const status = el.find('div.bsx a div.limit div.bt span.sb').text() || null;

    if (title || slug) {
        cards.push({
          title: title || null,
          slug: slug || null,
          poster: poster || null,
          type: type || null,
          status: status || null,
          episode: episode || null, // Keeping generic 'episode', could map to current_episode if needed
          animasu_url: slug ? `${BASE_URL}/anime/${slug}` : null
        });
    }
  });

  return cards;
};

export const getPaginationCount = ($) => {
  const pagination = $('div.pagination .page-numbers:not(.next)');
  let paginationCount;
  if (pagination.length > 0) {
    paginationCount = Number(pagination.last().text().trim());
  }

  return paginationCount || 1;
};

export const getPaginationButton = ($) => {
  const pagination = {};
  const prev = $('div.hpage a.l').text().trim();
  const next = $('div.hpage a.r').text().trim();

  pagination.prev = prev || null;
  pagination.next = next || null;

  return pagination;
};

export const getAnimeDetails = ($) => {
  const result = {};

  $('div.bigcontent').each((index, element) => {
    const el = $(element);
    const poster = el.find('div.thumb img:first-child').attr('data-src'); // img -> poster
    const title = el.find('div.infox h1').text().trim();
    const japanese_title = el.find('div.infox span.alter').text().trim(); // name -> japanese_title
    
    const getInfo = (key) => el.find(`div.infox div.spe span b:contains("${key}")`).first().parent().text().replace(key, '').trim();

    const status = getInfo('Status: ');
    const type = getInfo('Jenis: ');
    const release_date = getInfo('Rilis: '); // release -> release_date
    const duration = getInfo('Durasi: ');
    
    const synopsis = $('div.sinopsis p:first-child').text().trim();
    const episode_lists = []; // episodes -> episode_lists (otakudesu naming)
    const genres = [];
    
    // Animasu doesn't distinctly separate producers/studios easily in all pages, keeping what works
    
    el.find('div.infox div.spe span b:contains("Genre:")').parent().find('a').each((index, element) => {
      genres.push({
        name: $(element).text() || null, // genre -> name
        slug: $(element).attr('href')?.split('/')[4] || null,
        url: $(element).attr('href') || null
      });
    });

    $('div.bixbox ul#daftarepisode li').each((index, element) => {
      episode_lists.push({
        episode: $(element).find('span.lchx a').text().trim(),
        slug: $(element).find('span.lchx a').attr('href')?.split('/')[3],
        url: $(element).find('span.lchx a').attr('href')
      });
    });

    Object.assign(result, {
      title: title || null,
      japanese_title: japanese_title || null,
      poster: poster || null,
      status: status || null,
      release_date: release_date || null,
      duration: duration || null,
      type: type || null,
      synopsis: synopsis || null,
      genres: genres || null,
      episode_lists: episode_lists || null
    });
  });

  return result;
};

export const getAnimeEpisode = ($) => {
  const result = {};

  $('div.postbody article').each((index, element) => {
    const el = $(element);
    // Episode Detail usually doesn't need main poster, but kept for consistency
    const title = el.find('div.meta div.lm h1').text().trim();
    
    // Extract episode number/name
    const episode = el.find('div.meta div.lm span.epx a:first-child').text().trim();
    
    const stream_links = []; // iframes -> stream_links (Otakudesu naming convention)

    el.find('select.mirror option').each((index, element) => {
      const option = $(element);
      const val = option.attr('value');
      const decodedOptionValue = val ? Buffer.from(val, 'base64').toString('utf-8') : null;
      if (!decodedOptionValue) return;

      const iframeHtml = load(decodedOptionValue);
      const src = iframeHtml('iframe').attr('src');
      const label = option.text().trim() || null;
      if (!src) return;

      stream_links.push({
        resolution: label, // label -> resolution (approx)
        link: src,         // src -> link
        server: 'Animasu Server' 
      });
    });

    // Provide default stream url if available (first one)
    const stream_url = stream_links.length > 0 ? stream_links[0].link : null;

    Object.assign(result, {
      title: title || null,
      episode: episode || null,
      stream_url: stream_url,
      stream_links: stream_links || null,
      // Animasu generally doesn't expose direct download links easily without interaction, 
      // keeping structure simple.
    });
  });

  return result;
};


import { load } from 'cheerio';

export const getCards = ($) => {
  const cards = [];

  $('div.listupd div.listupd_custompage div.bs').each((index, element) => {
    const el = $(element);
    const name = el.find('div.bsx div.tt').text().trim();
    const slug = el.find('div.bsx a').attr('href')?.split('/')[4];
    const type = el.find('div.bsx a div.limit div.typez').text().trim();
    const episode = el.find('div.bsx a div.limit div.bt span.epx').text().trim();
    const img = el.find('div.bsx a div.limit img.lazy').attr('data-src');
    const status = el.find('div.bsx a div.limit div.bt span.sb').text() || null;

    cards.push({
      slug: slug || null,
      name: name || null,
      type: type || null,
      episode: episode || null,
      img: img || null,
      status: status || null,
    });
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
  const result = {}; // Changed to object for single detail

  $('div.bigcontent').each((index, element) => {
    const el = $(element);
    const img = el.find('div.thumb img:first-child').attr('data-src');
    const title = el.find('div.infox h1').text().trim();
    const name = el.find('div.infox span.alter').text().trim();
    
    // Helper helper to safely extract text
    const getInfo = (key) => el.find(`div.infox div.spe span b:contains("${key}")`).first().parent().text().replace(key, '').trim();

    const status = getInfo('Status: ');
    const type = getInfo('Jenis: ');
    const release = getInfo('Rilis: ');
    const duration = getInfo('Durasi: ');
    
    const synopsis = $('div.sinopsis p:first-child').text().trim();
    const episodes = [];
    const genres = [];
    const characterTypes = [];

    el.find('div.infox div.spe span b:contains("Genre:")').parent().find('a').each((index, element) => {
      genres.push({
        genre: $(element).text() || null,
        slug: $(element).attr('href')?.split('/')[4] || null
      });
    });

    el.find('div.infox div.spe span#tikar_shw b:contains("Karakter:")').parent().find('a').each((index, element) => {
      characterTypes.push({
        type: $(element).text() || null,
        slug: $(element).attr('href')?.split('/')[4] || null
      });
    });

    $('div.bixbox ul#daftarepisode li').each((index, element) => {
      episodes.push({
        episode: $(element).find('span.lchx a').text().trim(),
        slug: $(element).find('span.lchx a').attr('href')?.split('/')[3],
      });
    });

    Object.assign(result, {
      img: img || null,
      title: title || null,
      name: name || null,
      status: status || null,
      release: release || null,
      duration: duration || null,
      type: type || null,
      synopsis: synopsis || null,
      genres: genres || null,
      characterTypes: characterTypes || null,
      episodes: episodes || null
    });
  });

  return result;
};

export const getAnimeEpisode = ($) => {
  const result = {}; // Changed to object for single episode data

  $('div.postbody article').each((index, element) => {
    const el = $(element);
    const img = el.find('div.meta div.tb img').attr('data-src');
    const title = el.find('div.meta div.lm h1').text().trim();
    const name = el.find('div.meta div.lm span.epx a:first-child').text().trim();
    const episodeSlug = el.find('div.meta div.lm span.epx a:first-child').attr('href')?.split('/')[4];
    const status = el.find('div.releases h3 font').text().trim();
    const iframes = [];

    el.find('select.mirror option').each((index, element) => {
      const option = $(element);
      const val = option.attr('value');
      const decodedOptionValue = val ? Buffer.from(val, 'base64').toString('utf-8') : null;
      if (!decodedOptionValue) return;

      const iframeHtml = load(decodedOptionValue);
      const src = iframeHtml('iframe').attr('src');
      const label = option.text().trim() || null;
      if (!src) return;

      iframes.push({
        label: label,
        src: src,
      });
    });

    const episodes = [];

    // Correct selector for episode list in episode page usually similar to detail
    $('div.bixbox ul#daftarepisode li').each((index, element) => {
      episodes.push({
        episode: $(element).find('span.lchx a').text().trim(),
        slug: $(element).find('span.lchx a').attr('href')?.split('/')[3],
      });
    });

    Object.assign(result, {
      title: title || null,
      name: name || null,
      status: status || null,
      slug: episodeSlug || null,
      img: img || null,
      iframes: iframes || null,
      episodes: episodes || null
    });
  });

  return result;
};

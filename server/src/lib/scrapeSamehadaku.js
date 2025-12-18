import { load } from 'cheerio';

/**
 * Helper to extract slug from URL
 */
const extractSlug = (url) => {
  if (!url) return null;
  let path = url.replace(/^(?:https?:\/\/)?[^\/]+/, '');
  if (path.startsWith('/anime/')) {
      path = path.replace('/anime/', '');
  }
  return path.replace(/^\/|\/$/g, '');
};

/**
 * Scrape Search Results from Samehadaku
 */
export const scrapeSearch = ($) => {
  const results = [];

  $('.listupd article.bs').each((index, element) => {
    const $el = $(element);
    const $bsx = $el.find('.bsx');
    const $link = $bsx.find('a');
    const href = $link.attr('href');
    
    const title = $bsx.find('.tt h2').text().trim() || $bsx.find('.tt').contents().filter(function() {
        return this.type === 'text';
    }).text().trim();

    results.push({
      title,
      slug: extractSlug(href),
      thumbnail: $bsx.find('.limit img').attr('src') || null,
      status: $bsx.find('.limit .status').text().trim(),
      type: $bsx.find('.limit .typez').text().trim(),
      epx: $bsx.find('.limit .bt .epx').text().trim(),
      sub: $bsx.find('.limit .bt .sb').text().trim(),
      samehadaku_url: href
    });
  });

  return results;
};

/**
 * Scrape Anime List (untuk endpoint sesion/series list)
 */
export const scrapeAnimeList = (html) => {
    const $ = load(html);
    const anime_list = [];

    $('.listupd article.bs').each((index, element) => {
        const $el = $(element);
        const linkElem = $el.find('a[href*="/anime/"]').first();
        const fullUrl = linkElem.attr('href');
        const imgElem = $el.find('img.ts-post-image');

        anime_list.push({
            title: $el.find('h2[itemprop="headline"]').text().trim(),
            slug: extractSlug(fullUrl),
            image: imgElem.attr('src') || '',
            status: $el.find('.status').text().trim() || null,
            type: $el.find('.typez').text().trim() || null,
            episode_info: $el.find('.bt .epx').text().trim() || null,
            sub_type: $el.find('.bt .sb').text().trim() || null,
            anime_id: linkElem.attr('rel') || null,
            samehadaku_url: fullUrl
        });
    });

    const paginationSection = $('.hpage');
    const pagination = {
        has_prev: paginationSection.find('a.l').length > 0,
        has_next: paginationSection.find('a.r').length > 0,
        prev_url: paginationSection.find('a.l').attr('href') || null,
        next_url: paginationSection.find('a.r').attr('href') || null
    };

    return { anime_list, pagination };
};

/**
 * Scrape Latest Release Anime
 */
export const scrapeLatestRelease = ($) => {
  const results = [];
  $('.listupd .excstf article.bs').each((index, element) => {
    const $el = $(element);
    const title = $el.find('.bsx .tt').contents().filter(function() {
      return this.type === 'text';
    }).text().trim();
    const href = $el.find('.bsx a').attr('href');
    const slug = extractSlug(href);
    const thumbnail = $el.find('.bsx a .limit img').attr('src') || null;
    const current_episode = $el.find('.bsx a .limit .bt .epx').text().trim();
    const type = $el.find('.bsx a .limit .typez').text().trim();
    const status = $el.find('.bsx a .limit .status').text().trim() || null;
    const subOrDub = $el.find('.bsx a .limit .bt .sb').text().trim();
    results.push({ title, slug, thumbnail, current_episode, type, status, subOrDub });
  });
  return results;
};

/**
 * Scrape Spotlight (Banner Carousel)
 */
export const scrapeSpotlight = ($) => {
  const spotlightItems = [];
  $('.slidtop .loop .slide-item.full').each((index, element) => {
    try {
      const $item = $(element);
      const poster = $item.find('.slide-content .poster img').attr('src') || '';
      const $titleLink = $item.find('.slide-content .info-left .title .ellipsis a');
      const title = $titleLink.text().trim();
      const href = $titleLink.attr('href') || '';
      const slug = extractSlug(href);
      const year = $item.find('.slide-content .info-left .title .release-year').text().trim();
      const genres = [];
      $item.find('.slide-content .info-left .extras .extra-category a').each((i, el) => {
        genres.push($(el).text().trim());
      });
      const summary = $item.find('.slide-content .info-left .excerpt .story').text().trim();
      const statusText = $item.find('.slide-content .info-left .cast .director').text().trim();
      const status = statusText.replace('Status:', '').trim();
      const typeText = $item.find('.slide-content .info-left .cast .actor').text().trim();
      const type = typeText.replace('Type:', '').trim();
      spotlightItems.push({ title, slug, poster, year, type, status, genres, summary, samehadaku_url: href });
    } catch (error) { }
  });
  return spotlightItems;
};

/**
 * Scrape Top Series
 */
export const scrapeTopSeries = ($) => {
  const topSeriesData = { weekly: [], monthly: [], alltime: [] };
  const scrapeTab = (className) => {
    const items = [];
    const selector = `.serieslist.pop.wpop.${className} ul li`;
    $(selector).each((index, element) => {
      try {
        const $item = $(element);
        const rank = parseInt($item.find('.ctr').text().trim()) || 0;
        const poster = $item.find('.imgseries a.series img').attr('src') || '';
        const $titleLink = $item.find('.leftseries h4 a.series');
        const title = $titleLink.text().trim();
        const href = $titleLink.attr('href') || '';
        const slug = extractSlug(href);
        const genres = [];
        $item.find('.leftseries span a[rel="tag"]').each((i, el) => {
          genres.push($(el).text().trim());
        });
        const ratingText = $item.find('.rt .rating .numscore').text().trim();
        const rating = ratingText ? parseFloat(ratingText) : null;
        items.push({ rank, title, slug, poster, genres, rating, samehadaku_url: href });
      } catch (error) { }
    });
    return items;
  };
  topSeriesData.weekly = scrapeTab('wpop-weekly');
  topSeriesData.monthly = scrapeTab('wpop-monthly');
  topSeriesData.alltime = scrapeTab('wpop-alltime');
  return topSeriesData;
};

/**
 * Scrape Pagination
 */
export const scrapePagination = ($) => {
  const $pagination = $('.listupd .hpage');
  const $nextBtn = $pagination.find('a.r');
  const hasNext = $nextBtn.length > 0;
  const nextText = hasNext ? $nextBtn.text().trim() : null;
  const $prevBtn = $pagination.find('a.l');
  const hasPrev = $prevBtn.length > 0;
  const prevText = hasPrev ? $prevBtn.text().trim() : null;
  return { hasNext, hasPrev, nextText, prevText };
};

/**
 * Scrape Recommendations
 */
export const scrapeRecommendations = ($) => {
  const results = {};
  $('.series-gen .listupd .tab-pane').each((index, tabElement) => {
    const $tab = $(tabElement);
    const tabId = $tab.attr('id') || `tab-${index}`;
    const animeList = [];
    $tab.find('article.bs').each((idx, article) => {
      const $article = $(article);
      const title = $article.find('.bsx .tt').contents().filter(function() {
        return this.type === 'text';
      }).text().trim();
      const href = $article.find('.bsx a').attr('href');
      const slug = extractSlug(href);
      const thumbnail = $article.find('.bsx a .limit img').attr('src') || null;
      const statusEp = $article.find('.bsx a .limit .bt .epx').text().trim();
      const statusTag = $article.find('.bsx a .limit .status').text().trim();
      const type = $article.find('.bsx a .limit .typez').text().trim();
      const subOrDub = $article.find('.bsx a .limit .bt .sb').text().trim();
      animeList.push({ title, slug, thumbnail, status: statusTag || statusEp, type, subOrDub });
    });
    results[tabId] = animeList;
  });
  return results;
};

/**
 * Scrape Anime Detail
 */
export const scrapeAnimeDetail = ($) => {
    const result = { info: {}, characters_voice_actors: [], episodes: [], recommendations: [] };
    const container = $('.bixbox.animefull');
    if (container.length) {
        result.info.title = container.find('.infox h1.entry-title').text().trim();
        result.info.poster = container.find('.thumb img').attr('src');
        const ratingStr = container.find('.rating strong').text().trim();
        if (ratingStr) result.info.rating = ratingStr.replace('Rating', '').trim();
        container.find('.infox .spe span').each((i, el) => {
            const keyEl = $(el).find('b');
            const key = keyEl.text().replace(':', '').trim(); 
            const valueEl = $(el).clone();
            valueEl.find('b').remove(); 
            let value = valueEl.text().trim();
            if (valueEl.find('a').length > 0) {
                value = valueEl.find('a').map((i, link) => $(link).text().trim()).get().join(', ');
            }
            if (key) {
                const cleanKey = key.toLowerCase().replace(/\s+/g, '_');
                result.info[cleanKey] = value;
            }
        });
    }
    result.info.synopsis = $('.entry-content[itemprop="description"]').text().trim();
    result.info.trailer = $('a.trailerbutton').attr('href') || null;
    $('.cvlist .cvitem').each((i, el) => {
        const charEl = $(el).find('.cvchar');
        const actorEl = $(el).find('.cvactor');
        result.characters_voice_actors.push({
            character: {
                name: charEl.find('.charname').text().trim(),
                role: charEl.find('.charrole').text().trim(),
                image: charEl.find('img').attr('src')
            },
            voice_actor: {
                name: actorEl.find('.charname').text().trim(),
                language: actorEl.find('.charrole').text().trim(),
                image: actorEl.find('img').attr('src')
            }
        });
    });
    $('.bixbox.bxcl.epcheck ul li').each((i, el) => {
        const url = $(el).find('a').attr('href');
        result.episodes.push({
            episode_number: $(el).find('.epl-num').text().trim(),
            title: $(el).find('.epl-title').text().trim(),
            release_date: $(el).find('.epl-date').text().trim(),
            slug: extractSlug(url),
            samehadaku_url: url
        });
    });
    const recHeader = $('h3:contains("Recommended Series")'); 
    const recContainer = recHeader.closest('.bixbox').find('.listupd .bs');
    recContainer.each((i, el) => {
        const url = $(el).find('a').attr('href');
        result.recommendations.push({
            title: $(el).find('.tt h2').text().trim(),
            status: $(el).find('.limit .status').text().trim(),
            type: $(el).find('.limit .typez').text().trim(),
            image: $(el).find('img').attr('src'),
            url: url,
            slug: extractSlug(url)
        });
    });
    return result;
};

/**
 * Main function to scrape entire home page
 */
export const scrapeHomePage = (html) => {
  const $ = load(html);
  return {
    spotlight: scrapeSpotlight($),
    latestRelease: scrapeLatestRelease($),
    topSeries: scrapeTopSeries($),
    recommendations: scrapeRecommendations($),
    pagination: scrapePagination($),
  };
};
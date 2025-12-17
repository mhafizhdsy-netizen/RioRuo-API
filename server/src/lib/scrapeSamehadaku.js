
import { load } from 'cheerio';

/**
 * Helper to extract slug from URL
 * Handles:
 * - https://samehadaku.li/anime/slug/
 * - https://samehadaku.li/slug-episode-1/
 * - https://samehadaku.li/movie-slug/
 */
const extractSlug = (url) => {
  if (!url) return null;
  // Remove protocol and domain
  let path = url.replace(/^(?:https?:\/\/)?[^\/]+/, '');
  // Remove /anime/ prefix if present
  path = path.replace(/^\/anime\//, '/');
  // Remove leading and trailing slashes
  return path.replace(/^\/|\/$/g, '');
};

/**
 * Scrape Latest Release Anime
 * CSS Selector: .listupd .excstf article.bs
 * Now accepts CheerioAPI instance
 */
export const scrapeLatestRelease = ($) => {
  const results = [];

  // Selector: .listupd .excstf article.bs
  $('.listupd .excstf article.bs').each((index, element) => {
    const $el = $(element);

    // Title is the text node inside .tt, excluding the <h2> child
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

    results.push({
      title,
      slug,
      thumbnail,
      current_episode,
      type,
      status,
      subOrDub,
    });
  });

  return results;
};

/**
 * Scrape Spotlight (Banner Carousel)
 * CSS Selector: .slidtop .loop .slide-item.full
 */
export const scrapeSpotlight = ($) => {
  const spotlightItems = [];
  
  $('.slidtop .loop .slide-item.full').each((index, element) => {
    try {
      const $item = $(element);
      
      // Gambar
      const poster = $item.find('.slide-content .poster img').attr('src') || '';
      
      // Title
      const $titleLink = $item.find('.slide-content .info-left .title .ellipsis a');
      const title = $titleLink.text().trim();
      
      // Slug & Link
      const href = $titleLink.attr('href') || '';
      const slug = extractSlug(href);
      
      // Year
      const year = $item.find('.slide-content .info-left .title .release-year').text().trim();
      
      // Genres
      const genres = [];
      $item.find('.slide-content .info-left .extras .extra-category a').each((i, el) => {
        genres.push($(el).text().trim());
      });
      
      // Summary
      const summary = $item.find('.slide-content .info-left .excerpt .story').text().trim();
      
      // Status
      const statusText = $item.find('.slide-content .info-left .cast .director').text().trim();
      const status = statusText.replace('Status:', '').trim();
      
      // Type
      const typeText = $item.find('.slide-content .info-left .cast .actor').text().trim();
      const type = typeText.replace('Type:', '').trim();
      
      spotlightItems.push({
        title,
        slug,
        poster,
        year,
        type,
        status,
        genres,
        summary,
        samehadaku_url: href // Changed from otakudesu_url
      });
    } catch (error) {
      console.error('Error parsing spotlight item:', error.message);
    }
  });
  
  return spotlightItems;
};

/**
 * Scrape Top Series (Weekly, Monthly, Alltime)
 * Helper function included inside
 */
export const scrapeTopSeries = ($) => {
  const topSeriesData = {
    weekly: [],
    monthly: [],
    alltime: []
  };
  
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
        
        items.push({
          rank,
          title,
          slug,
          poster,
          genres,
          rating,
          samehadaku_url: href // Changed from otakudesu_url
        });
      } catch (error) {
        // Silent fail for individual items
      }
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
 * CSS Selector: .listupd .hpage
 * Now accepts CheerioAPI instance
 */
export const scrapePagination = ($) => {
  const $pagination = $('.listupd .hpage');

  // Check for next button: a.r
  const $nextBtn = $pagination.find('a.r');
  const hasNext = $nextBtn.length > 0;
  const nextText = hasNext ? $nextBtn.text().trim() : null;

  // Check for prev button: a.l
  const $prevBtn = $pagination.find('a.l');
  const hasPrev = $prevBtn.length > 0;
  const prevText = hasPrev ? $prevBtn.text().trim() : null;

  return {
    hasNext,
    hasPrev,
    nextText,
    prevText,
  };
};

/**
 * Scrape Recommendations by Genre Tabs
 * CSS Selector: .series-gen .listupd .tab-pane
 * Now accepts CheerioAPI instance
 */
export const scrapeRecommendations = ($) => {
  const results = {};

  // Scrape each tab-pane
  $('.series-gen .listupd .tab-pane').each((index, tabElement) => {
    const $tab = $(tabElement);
    const tabId = $tab.attr('id') || `tab-${index}`;
    const animeList = [];

    // Scrape articles in this tab
    $tab.find('article.bs').each((idx, article) => {
      const $article = $(article);

      const title = $article.find('.bsx .tt').contents().filter(function() {
        return this.type === 'text';
      }).text().trim();

      const href = $article.find('.bsx a').attr('href');
      const slug = extractSlug(href);

      const thumbnail = $article.find('.bsx a .limit img').attr('src') || null;

      // In recommendations, .epx often holds status like "Completed" or "Ongoing"
      const statusEp = $article.find('.bsx a .limit .bt .epx').text().trim();
      const statusTag = $article.find('.bsx a .limit .status').text().trim();
      
      const type = $article.find('.bsx a .limit .typez').text().trim();

      const subOrDub = $article.find('.bsx a .limit .bt .sb').text().trim();

      animeList.push({
        title,
        slug,
        thumbnail,
        status: statusTag || statusEp,
        type,
        subOrDub,
      });
    });

    results[tabId] = animeList;
  });

  return results;
};

/**
 * Scrape Anime Detail
 * Implementasi logika dari file animedetail.txt
 * CSS Selector: .bixbox.animefull, .infox, etc
 */
export const scrapeAnimeDetail = ($) => {
    const result = {
        info: {},
        characters_voice_actors: [],
        episodes: [],
        recommendations: []
    };

    // 1. INFO UTAMA ANIME
    const container = $('.bixbox.animefull');

    if (container.length) {
        // Title
        result.info.title = container.find('.infox h1.entry-title').text().trim();

        // Poster
        result.info.poster = container.find('.thumb img').attr('src');

        // Rating
        // Selector based on HTML: <div class="rating"><strong>Rating 7.82</strong></div>
        const ratingStr = container.find('.rating strong').text().trim();
        if (ratingStr) {
            result.info.rating = ratingStr.replace('Rating', '').trim();
        }

        // Detail Info loop (Status, Studio, dll)
        container.find('.infox .spe span').each((i, el) => {
            const keyEl = $(el).find('b');
            const key = keyEl.text().replace(':', '').trim(); 
            
            // Clone elemen, hapus <b>, ambil sisa teksnya
            const valueEl = $(el).clone();
            valueEl.find('b').remove(); 
            let value = valueEl.text().trim();

            // Jika value berupa link (seperti Studio/Season), ambil teks linknya
            if (valueEl.find('a').length > 0) {
                value = valueEl.find('a').map((i, link) => $(link).text().trim()).get().join(', ');
            }

            if (key) {
                // Format key jadi lowercase_underscore (misal: "Posted by" -> "posted_by")
                const cleanKey = key.toLowerCase().replace(/\s+/g, '_');
                result.info[cleanKey] = value;
            }
        });
    }

    // 2. SINOPSIS & TRAILER (Moved into info object)
    result.info.synopsis = $('.entry-content[itemprop="description"]').text().trim();
    
    // Trailer URL
    // Selector: <a data-fancybox href="..." class="trailerbutton">
    result.info.trailer = $('a.trailerbutton').attr('href') || null;

    // 3. CHARACTER & VOICE ACTOR
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

    // 4. LIST EPISODE
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

    // 5. RECOMMENDED SERIES
    // Kita filter .listupd yang berada di bawah header "Recommended Series"
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
    recommendations: scrapeRecommendations($), // Recommendations moved up
    pagination: scrapePagination($), // Pagination moved down
  };
};

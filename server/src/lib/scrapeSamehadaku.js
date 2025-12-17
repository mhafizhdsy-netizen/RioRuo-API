
import { load } from 'cheerio';

/**
 * Scrape Latest Release Anime
 * CSS Selector: .listupd .excstf article.bs
 */
export const scrapeLatestRelease = (html) => {
  const $ = load(html);
  const results = [];

  // Selector: .listupd .excstf article.bs
  $('.listupd .excstf article.bs').each((index, element) => {
    const $el = $(element);

    // Title is the text node inside .tt, excluding the <h2> child
    const title = $el.find('.bsx .tt').contents().filter(function() {
      return this.type === 'text';
    }).text().trim();

    // URL: https://samehadaku.li/slug-episode-1/
    // Split: ['https:', 'samehadaku.li', 'slug-episode-1'] -> Index 2
    const slug = $el.find('.bsx a').attr('href')?.split('/').filter(Boolean)[2] || null;
    
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
 * Scrape Pagination
 * CSS Selector: .listupd .hpage
 */
export const scrapePagination = (html) => {
  const $ = load(html);

  // Selector: .listupd .hpage
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
 */
export const scrapeRecommendations = (html) => {
  const $ = load(html);
  const results = {};

  // Get tab names from nav-tabs
  const tabs = [];
  $('.series-gen .nav-tabs li').each((index, element) => {
    const tabName = $(element).find('a').text().trim();
    const tabId = $(element).find('a').attr('href')?.replace('#', '') || '';
    if (tabName && tabId) {
      tabs.push(tabId);
    }
  });

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

      // URL: https://samehadaku.li/anime/slug/
      // Split: ['https:', 'samehadaku.li', 'anime', 'slug'] -> Index 3
      const slug = $article.find('.bsx a').attr('href')?.split('/').filter(Boolean)[3] || null;

      const thumbnail = $article.find('.bsx a .limit img').attr('src') || null;

      // In recommendations, .epx often holds status like "Completed" or "Ongoing"
      const statusEp = $article.find('.bsx a .limit .bt .epx').text().trim();
      const statusTag = $article.find('.bsx a .limit .status').text().trim();
      
      const type = $article.find('.bsx a .limit .typez').text().trim();

      const subOrDub = $article.find('.bsx a .limit .bt .sb').text().trim();

      // Genres are NOT available in the card structure for .series-gen based on home.html.txt
      const genres = []; 

      animeList.push({
        title,
        slug,
        thumbnail,
        status: statusTag || statusEp,
        type,
        subOrDub,
        genres,
      });
    });

    results[tabId] = animeList;
  });

  return results;
};

/**
 * Main function to scrape entire home page
 */
export const scrapeHomePage = (html) => {
  return {
    latestRelease: scrapeLatestRelease(html),
    pagination: scrapePagination(html),
    recommendations: scrapeRecommendations(html),
  };
};

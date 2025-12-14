import * as cheerio from 'cheerio';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { Builder, By, until } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');

const BASE_URL = 'https://samehadaku.how';

// --- Helper Functions ---

const fetchHTML = async (endpoint, params = {}) => {
  const urlObj = new URL(endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`);
  Object.keys(params).forEach(key => {
    if (params[key]) urlObj.searchParams.append(key, params[key]);
  });
  
  const targetUrl = urlObj.toString();
  console.log(`[Scraper] Fetching via Selenium: ${targetUrl}`);

  let driver;
  try {
    const options = new Options();
    options.addArguments('--headless=new'); // Modern headless mode
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');
    options.addArguments('--disable-blink-features=AutomationControlled');
    options.addArguments('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    options.addArguments('--ignore-certificate-errors');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    await driver.get(targetUrl);

    // Wait for the body to be present
    await driver.wait(until.elementLocated(By.css('body')), 15000);
    
    // Explicit wait for Cloudflare challenge or dynamic content
    // We wait for a common element in Samehadaku's theme to ensure we passed the "Just a moment" screen
    try {
        // Try waiting for the footer or main content
        await driver.wait(until.elementLocated(By.css('.site-content, .hfeed, footer')), 5000);
    } catch (e) {
        // Fallback: just wait a bit if specific element not found (maybe different page structure)
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    const html = await driver.getPageSource();
    return cheerio.load(html);

  } catch (error) {
    console.error(`[Scraper Error] Failed to fetch ${targetUrl}:`, error.message);
    throw error;
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
};

const extractId = (url) => {
  if (!url) return '';
  return url.split('/').filter(part => part && part !== 'https:' && part !== 'http:' && part !== 'samehadaku.how' && part !== 'v1.samehadaku.how').pop();
};

const extractPagination = ($) => {
  const pagination = {
    currentPage: 1,
    hasPrevPage: false,
    prevPage: null,
    hasNextPage: false,
    nextPage: null,
    totalPages: 1
  };

  const paginationElem = $('.pagination');
  if (paginationElem.length) {
    const current = paginationElem.find('.current').text();
    pagination.currentPage = parseInt(current) || 1;
    
    const next = paginationElem.find('.next');
    pagination.hasNextPage = next.length > 0;
    if (pagination.hasNextPage) pagination.nextPage = pagination.currentPage + 1;

    const prev = paginationElem.find('.prev');
    pagination.hasPrevPage = prev.length > 0;
    if (pagination.hasPrevPage) pagination.prevPage = pagination.currentPage - 1;

    // Try to find max page
    const lastPageText = paginationElem.find('.page-numbers:not(.next):not(.prev)').last().text();
    pagination.totalPages = parseInt(lastPageText) || pagination.currentPage;
  }
  return pagination;
};

// --- Route Handlers ---

export const getHome = async () => {
  const $ = await fetchHTML('/');
  
  const result = {
    recent: { 
      href: "/samehadaku/recent", 
      samehadakuUrl: `${BASE_URL}/anime-terbaru/`, 
      animeList: [] 
    },
    batch: { 
      href: "/samehadaku/batch", 
      samehadakuUrl: `${BASE_URL}/daftar-batch/`, 
      batchList: [] 
    },
    movie: { 
      href: "/samehadaku/movies", 
      samehadakuUrl: `${BASE_URL}/anime-movie/`, 
      animeList: [] 
    },
    top10: { 
      href: "/samehadaku/popular", 
      samehadakuUrl: BASE_URL, 
      animeList: [] 
    }
  };

  // 1. Recent Updates (Anime Terbaru)
  $('.post-show ul li').each((i, el) => {
    const title = $(el).find('.entry-title a').text().trim();
    const samehadakuUrl = $(el).find('.entry-title a').attr('href');
    const animeId = extractId(samehadakuUrl);
    const poster = $(el).find('.thumb img').attr('src');
    
    let episodes = $(el).find('.dtla span:first-of-type author').text().trim();
    if (!episodes) {
        episodes = $(el).find('.dtla span:first-of-type').text().replace(/Episode/i, '').trim();
    }

    let releasedOn = $(el).find('.dtla span:last-of-type').text().replace(/Released on:?/i, '').trim();

    if (title) {
        result.recent.animeList.push({
            title, poster, episodes, releasedOn, animeId,
            href: `/anime/samehadaku/anime/${animeId}`,
            samehadakuUrl
        });
    }
  });

  // 2. Movies
  $('.widgets').each((i, widget) => {
     const headerText = $(widget).find('h3').text();
     if (headerText.toLowerCase().includes('movie')) {
         $(widget).find('.widgetseries ul li').each((j, item) => {
             const title = $(item).find('.lftinfo h2 a').text().trim();
             const samehadakuUrl = $(item).find('.lftinfo h2 a').attr('href');
             const animeId = extractId(samehadakuUrl);
             const poster = $(item).find('.imgseries img').attr('src');
             const releasedOn = $(item).find('.lftinfo span:last-child').text().trim();
             
             if (title) {
                 result.movie.animeList.push({
                     title, poster, releasedOn, animeId,
                     href: `/anime/samehadaku/anime/${animeId}`,
                     samehadakuUrl
                 });
             }
         });
     }
  });

  // 3. Top 10
  $('.topten-animesu ul li').each((i, el) => {
    const title = $(el).find('.judul').text().trim();
    const samehadakuUrl = $(el).find('a.series').attr('href');
    const animeId = extractId(samehadakuUrl);
    const poster = $(el).find('img').attr('src');
    const score = $(el).find('.rating').text().trim();
    const rankText = $(el).find('.is-topten b').last().text().trim();
    const rank = parseInt(rankText) || i + 1;

    if (title) {
        result.top10.animeList.push({
            rank, title, poster, score, animeId,
            href: `/anime/samehadaku/anime/${animeId}`,
            samehadakuUrl
        });
    }
  });

  return { data: result };
};

export const getRecent = async (req) => {
  const page = req.query.page || 1;
  const $ = await fetchHTML(`/anime-terbaru/page/${page}/`); 
  
  const animeList = [];
  $('.post-show ul li').each((i, el) => {
    const title = $(el).find('.entry-title a').text().trim();
    const poster = $(el).find('.thumb img').attr('src');
    const samehadakuUrl = $(el).find('.entry-title a').attr('href');
    const animeId = extractId(samehadakuUrl);

    let episodes = $(el).find('.dtla span:first-of-type author').text().trim();
    if (!episodes) {
        episodes = $(el).find('.dtla span:first-of-type').text().replace(/Episode/i, '').trim();
    }

    let releasedOn = $(el).find('.dtla span:last-of-type').text().replace(/Released on:?/i, '').trim();

    animeList.push({
      title, poster, episodes, releasedOn, animeId,
      href: `/anime/samehadaku/anime/${animeId}`,
      samehadakuUrl
    });
  });

  return { data: { animeList }, pagination: extractPagination($) };
};

export const getSearch = async (req) => {
  const { q, page = 1 } = req.query;
  const $ = await fetchHTML(`/page/${page}/`, { s: q });

  const animeList = [];
  $('.film-list .animepost').each((i, el) => {
    const title = $(el).find('.animetitles').text().trim();
    const poster = $(el).find('img').attr('src');
    const type = $(el).find('.type').text().trim();
    const score = $(el).find('.score').text().trim();
    const status = $(el).find('.status').text().trim();
    const samehadakuUrl = $(el).find('a').attr('href');
    const animeId = extractId(samehadakuUrl);

    if (title) {
        animeList.push({
          title, poster, type, score, status, animeId,
          href: `/anime/samehadaku/anime/${animeId}`,
          samehadakuUrl
        });
    }
  });

  return { data: { animeList }, pagination: extractPagination($) };
};

export const getOngoing = async (req) => {
  const { page = 1, order = 'popular' } = req.query; 
  const $ = await fetchHTML(`/daftar-anime-2/page/${page}/`, { status: 'Ongoing', order }); 
  
  const animeList = [];
  $('.animepost').each((i, el) => {
    const title = $(el).find('.animetitles').text().trim();
    const poster = $(el).find('img').attr('src');
    const score = $(el).find('.score').text().trim();
    const type = $(el).find('.type').text().trim();
    const samehadakuUrl = $(el).find('a').attr('href');
    const animeId = extractId(samehadakuUrl);
    
    animeList.push({
        title, poster, type, score, status: 'Ongoing', animeId,
        href: `/anime/samehadaku/anime/${animeId}`,
        samehadakuUrl,
        genreList: []
    });
  });

  return { data: { animeList }, pagination: extractPagination($) };
};

export const getCompleted = async (req) => {
    const { page = 1, order = 'latest' } = req.query;
    const $ = await fetchHTML(`/daftar-anime-2/page/${page}/`, { status: 'Completed', order });
    
    const animeList = [];
    $('.animepost').each((i, el) => {
      const title = $(el).find('.animetitles').text().trim();
      const poster = $(el).find('img').attr('src');
      const score = $(el).find('.score').text().trim();
      const type = $(el).find('.type').text().trim();
      const samehadakuUrl = $(el).find('a').attr('href');
      const animeId = extractId(samehadakuUrl);
  
      animeList.push({
          title, poster, type, score, status: 'Completed', animeId,
          href: `/anime/samehadaku/anime/${animeId}`,
          samehadakuUrl,
          genreList: []
      });
    });
  
    return { data: { animeList }, pagination: extractPagination($) };
};

export const getPopular = async (req) => {
    const { page = 1 } = req.query;
    const $ = await fetchHTML(`/daftar-anime-2/page/${page}/`, { order: 'popular' });
    const animeList = [];
    $('.animepost').each((i, el) => {
        const title = $(el).find('.animetitles').text().trim();
        const poster = $(el).find('img').attr('src');
        const score = $(el).find('.score').text().trim();
        const type = $(el).find('.type').text().trim();
        const samehadakuUrl = $(el).find('a').attr('href');
        const animeId = extractId(samehadakuUrl);
        const status = "Ongoing"; 
        
        animeList.push({ 
            title, poster, type, score, status, animeId, 
            href: `/anime/samehadaku/anime/${animeId}`, 
            samehadakuUrl,
            genreList: [] 
        });
    });
    return { data: { animeList }, pagination: extractPagination($) };
};

export const getMovies = async (req) => {
    const { page = 1 } = req.query;
    const $ = await fetchHTML(`/anime-movie/page/${page}/`);
    const animeList = [];
    $('.animepost').each((i, el) => {
        const title = $(el).find('.animetitles').text().trim();
        const poster = $(el).find('img').attr('src');
        const score = $(el).find('.score').text().trim();
        const type = "Movie";
        const samehadakuUrl = $(el).find('a').attr('href');
        const animeId = extractId(samehadakuUrl);
        
        animeList.push({ 
            title, poster, type, score, status: 'Completed', animeId, 
            href: `/anime/samehadaku/anime/${animeId}`, 
            samehadakuUrl,
            genreList: []
        });
    });
    return { data: { animeList }, pagination: extractPagination($) };
};

export const getSchedule = async () => {
    const $ = await fetchHTML(`/jadwal-rilis/`);
    const days = [];
    $('.schedule .tab-pane').each((i, el) => {
        const day = $(el).attr('id'); 
        const animeList = [];
        $(el).find('.schedule-item').each((j, item) => {
            const title = $(item).find('.entry-title a').text().trim();
            const samehadakuUrl = $(item).find('.entry-title a').attr('href');
            const animeId = extractId(samehadakuUrl);
            const poster = $(item).find('.thumb img').attr('src');
            const score = $(item).find('.score').text().trim();
            const estimation = $(item).find('.time').text().trim();
            const type = "TV";
            const genres = $(item).find('.dtla span').last().text().trim();
            
            animeList.push({ 
                title, poster, type, score, estimation, genres, animeId, 
                href: `/anime/samehadaku/anime/${animeId}`, 
                samehadakuUrl 
            });
        });
        if(day && animeList.length) days.push({ day, animeList });
    });
    return { data: { days } };
};

export const getGenres = async () => {
    const $ = await fetchHTML(`/daftar-anime-2/`);
    const genreList = [];
    $('.genre > li > a').each((i, el) => {
        const title = $(el).text().trim();
        const samehadakuUrl = $(el).attr('href');
        const genreId = samehadakuUrl ? samehadakuUrl.split('/genre/')[1].replace('/', '') : '';
        if(title) genreList.push({ title, genreId, href: `/anime/samehadaku/genres/${genreId}`, samehadakuUrl });
    });
    return { data: { genreList } };
};

export const getAnimeByGenre = async (req) => {
    const { genreId } = req.params;
    const { page = 1 } = req.query;
    const $ = await fetchHTML(`/genre/${genreId}/page/${page}/`);
    
    const animeList = [];
    $('.animepost').each((i, el) => {
        const title = $(el).find('.animetitles').text().trim();
        const poster = $(el).find('img').attr('src');
        const score = $(el).find('.score').text().trim();
        const type = $(el).find('.type').text().trim();
        const samehadakuUrl = $(el).find('a').attr('href');
        const animeId = extractId(samehadakuUrl);
        const status = "Completed";
        
        animeList.push({ 
            title, poster, type, score, status, animeId, 
            href: `/anime/samehadaku/anime/${animeId}`, 
            samehadakuUrl,
            genreList: []
        });
    });
    return { data: { animeList }, pagination: extractPagination($) };
};

export const getBatchList = async (req) => {
    const { page = 1 } = req.query;
    const $ = await fetchHTML(`/daftar-batch/page/${page}/`);
    const batchList = [];
    $('.post-show ul li').each((i, el) => {
        const title = $(el).find('.entry-title a').text().trim();
        const samehadakuUrl = $(el).find('.entry-title a').attr('href');
        const batchId = extractId(samehadakuUrl);
        const poster = $(el).find('.thumb img').attr('src');
        
        batchList.push({ 
            title, poster, type: "TV", score: "N/A", status: "Completed", batchId, 
            href: `/anime/samehadaku/batch/${batchId}`, 
            samehadakuUrl,
            genreList: []
        });
    });
    return { data: { batchList }, pagination: extractPagination($) };
};

export const getBatchDetail = async (req) => {
    const { batchId } = req.params;
    const $ = await fetchHTML(`/${batchId}/`);
    
    const title = $('.entry-title').text().trim();
    const poster = $('.thumb img').attr('src');
    const status = "Completed"; 
    
    let score = "";
    let japanese = "";
    $('.infox .spe span').each((i, el) => {
       const text = $(el).text();
       if(text.includes('Score')) score = text.replace('Score:', '').trim();
       if(text.includes('Japanese')) japanese = text.replace('Japanese:', '').trim();
    });

    const genreList = [];
    $('.genre-info a').each((i, el) => {
        genreList.push({ 
            title: $(el).text(), 
            genreId: extractId($(el).attr('href')),
            href: `/anime/samehadaku/genres/${extractId($(el).attr('href'))}`, 
            samehadakuUrl: $(el).attr('href')
        });
    });

    const downloadUrl = { formats: [] };
    $('.download-eps').each((i, el) => {
        const formatTitle = $(el).find('p').text().trim() || $(el).prev().text().trim() || "Unknown";
        const qualities = [];
        $(el).find('ul li').each((j, qual) => {
            const qualityTitle = $(qual).find('strong').text().trim();
            const urls = [];
            $(qual).find('a').each((k, link) => {
                urls.push({ title: $(link).text().trim(), url: $(link).attr('href') });
            });
            qualities.push({ title: qualityTitle, urls });
        });
        downloadUrl.formats.push({ title: formatTitle, qualities });
    });

    return { 
        data: { 
            title, batchId, poster, japanese, status, type: "TV", source: "Unknown", score, 
            genreList, downloadUrl 
        } 
    };
};

export const getAnimeDetail = async (req) => {
    const { animeId } = req.params;
    const $ = await fetchHTML(`/anime/${animeId}/`);
    
    const title = $('.infox .entry-title').text().trim();
    const poster = $('.infox .thumb img').attr('src');
    const scoreVal = $('.rating-value').text().trim();
    const scoreUsers = $('.rating-count').text().trim();
    const score = { value: scoreVal, users: scoreUsers };
    
    const synopsis = { paragraphs: [], connections: [] };
    $('.entry-content p').each((i, el) => {
        const pText = $(el).text().trim();
        if(pText) synopsis.paragraphs.push(pText);
    });

    const genreList = [];
    $('.genre-info a').each((i, el) => {
        genreList.push({ 
            title: $(el).text(), 
            genreId: extractId($(el).attr('href')),
            href: `/anime/samehadaku/genres/${extractId($(el).attr('href'))}`, 
            samehadakuUrl: $(el).attr('href')
        });
    });

    const episodeList = [];
    $('.lstepsiode.listeps ul li').each((i, el) => {
        const epTitle = $(el).find('.eps a').text().trim();
        const epUrl = $(el).find('.eps a').attr('href');
        const episodeId = extractId(epUrl);
        
        episodeList.push({ 
            title: epTitle, 
            episodeId, 
            href: `/anime/samehadaku/episode/${episodeId}`, 
            samehadakuUrl: epUrl 
        });
    });

    const batchList = [];
    $('.listbatch a').each((i, el) => {
         batchList.push({
             title: $(el).text().trim(),
             batchId: extractId($(el).attr('href')),
             href: `/anime/samehadaku/batch/${extractId($(el).attr('href'))}`,
             samehadakuUrl: $(el).attr('href')
         });
    });

    let japanese = "", synonyms = "", english = "", status = "", type = "", source = "", duration = "";
    let season = "", studios = "", producers = "", aired = "";
    
    $('.infox .spe span').each((i, el) => {
        const content = $(el).text();
        if(content.includes('Japanese:')) japanese = content.replace('Japanese:', '').trim();
        if(content.includes('Synonyms:')) synonyms = content.replace('Synonyms:', '').trim();
        if(content.includes('English:')) english = content.replace('English:', '').trim();
        if(content.includes('Status:')) status = content.replace('Status:', '').trim();
        if(content.includes('Type:')) type = content.replace('Type:', '').trim();
        if(content.includes('Source:')) source = content.replace('Source:', '').trim();
        if(content.includes('Duration:')) duration = content.replace('Duration:', '').trim();
        if(content.includes('Season:')) season = content.replace('Season:', '').trim();
        if(content.includes('Studio:')) studios = content.replace('Studio:', '').trim();
        if(content.includes('Producers:')) producers = content.replace('Producers:', '').trim();
        if(content.includes('Aired:')) aired = content.replace('Aired:', '').trim();
    });

    return { 
        data: { 
            title, poster, score, japanese, synonyms, english, status, type, 
            source, duration, season, studios, producers, aired, trailer: '',
            animeId, href: `/anime/samehadaku/anime/${animeId}`, samehadakuUrl: `${BASE_URL}/anime/${animeId}/`,
            synopsis, genreList, batchList, episodeList 
        } 
    };
};

export const getEpisodeDetail = async (req) => {
    const { episodeId } = req.params;
    const $ = await fetchHTML(`/${episodeId}/`);
    
    const title = $('.entry-title').text().trim();
    const poster = $('.thumb img').attr('src'); 
    const releasedOn = $('.time-post').text().trim();
    
    const animeParentLink = $('.breadcrumb a').last().prev(); 
    const animeId = extractId(animeParentLink.attr('href'));
    
    const defaultStreamingUrl = $('#player_embed iframe').attr('src') || '';
    
    const prevLink = $('.naveps .nvs a[rel="prev"]').attr('href');
    const nextLink = $('.naveps .nvs a[rel="next"]').attr('href');
    
    const prevEpisode = prevLink ? {
        title: "Prev",
        episodeId: extractId(prevLink),
        href: `/anime/samehadaku/episode/${extractId(prevLink)}`,
        samehadakuUrl: prevLink
    } : null;

    const nextEpisode = nextLink ? {
        title: "Next",
        episodeId: extractId(nextLink),
        href: `/anime/samehadaku/episode/${extractId(nextLink)}`,
        samehadakuUrl: nextLink
    } : null;

    const server = { qualities: [] };
    $('#server ul li').each((i, el) => {
        const qualityName = $(el).find('span').text().trim() || "Unknown"; 
        const serverList = [];
        const postData = $(el).find('div[data-post]').attr('data-post');
        const numData = $(el).find('div[data-nume]').attr('data-nume');
        
        serverList.push({
            title: "Server " + (i+1),
            serverId: `${postData}-${numData}`, 
            href: `/anime/samehadaku/server/${postData}-${numData}`
        });
        
        server.qualities.push({ title: qualityName, serverList });
    });

    const downloadUrl = { formats: [] };
    $('.download-eps').each((i, el) => {
        const formatTitle = $(el).find('p').text().trim() || "Format " + (i+1);
        const qualities = [];
        
        $(el).find('ul li').each((j, qual) => {
            const qualityTitle = $(qual).find('strong').text().trim();
            const urls = [];
            $(qual).find('a').each((k, link) => {
                urls.push({ title: $(link).text().trim(), url: $(link).attr('href') });
            });
            qualities.push({ title: qualityTitle, urls });
        });
        downloadUrl.formats.push({ title: formatTitle, qualities });
    });

    const synopsis = { paragraphs: [], connections: [] };
    $('.entry-content').find('p').each((i, el) => {
         const txt = $(el).text().trim();
         if(txt && !txt.includes('Download')) synopsis.paragraphs.push(txt);
    });

    const genreList = [];
    $('.genre-info a').each((i, el) => {
        genreList.push({ 
            title: $(el).text(), 
            genreId: extractId($(el).attr('href')),
            href: `/anime/samehadaku/genres/${extractId($(el).attr('href'))}`, 
            samehadakuUrl: $(el).attr('href')
        });
    });

    return { 
        data: { 
            title, animeId, poster, releasedOn, defaultStreamingUrl, 
            hasPrevEpisode: !!prevEpisode, prevEpisode, 
            hasNextEpisode: !!nextEpisode, nextEpisode, 
            synopsis, genreList, server, downloadUrl 
        } 
    };
};

export const getServerUrl = async (req) => {
    const { serverId } = req.params;
    return { data: { url: `https://filedon.co/embed/${serverId}` } };
};
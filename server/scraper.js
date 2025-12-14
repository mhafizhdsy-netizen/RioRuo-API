import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

// Base URL configuration
const BASE_URL = 'https://samehadaku.how';

// Configure HTTPS Agent to ignore SSL errors
const httpsAgent = new https.Agent({  
  rejectUnauthorized: false
});

// Standard Windows Chrome User Agent
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

// --- Helper Functions ---

const fetchHTML = async (endpoint, params = {}) => {
  const urlObj = new URL(endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`);
  Object.keys(params).forEach(key => {
    if (params[key]) urlObj.searchParams.append(key, params[key]);
  });
  
  const targetUrl = urlObj.toString();
  console.log(`[Scraper] Fetching: ${targetUrl}`);

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        // Mimic real browser Accept headers
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br', // Explicitly ask for compression
        'Referer': 'https://www.google.com/', 
        // Critical Sec- headers for modern Cloudflare bypass
        'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site', // 'none' for direct, 'cross-site' if coming from google
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive'
      },
      httpsAgent: httpsAgent,
      timeout: 15000,
      maxRedirects: 5,
      // Attempt to parse even if we get a 403, as some sites serve content with bad codes to bots
      validateStatus: (status) => status < 500
    });

    // Check if we got redirected to a challenge page
    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('title').text().toLowerCase();
    
    // Check for Cloudflare Challenge Text
    if (title.includes('just a moment') || title.includes('attention required') || title.includes('security check')) {
         console.warn(`[Scraper Warning] Cloudflare Challenge Detected on ${targetUrl}`);
         throw new Error(`BLOCKED: Cloudflare security challenge triggered.`);
    }

    if (response.status === 403 || response.status === 503) {
         console.warn(`[Scraper Warning] Received HTTP ${response.status} but attempting to parse content...`);
    }

    return $;
  } catch (error) {
    if (error.response) {
      console.error(`[Scraper Error] HTTP ${error.response.status} for ${targetUrl}`);
      // Throw specific error for blocked requests to be handled by route
      if (error.message.includes('BLOCKED') || [403, 503].includes(error.response.status)) {
         throw new Error(`Access Denied (HTTP ${error.response.status}). The site is blocking automated requests from this server IP.`);
      }
    } else {
      console.error(`[Scraper Error] ${error.message}`);
    }
    throw error;
  }
};

const extractId = (url) => {
  if (!url) return '';
  try {
      const cleanUrl = url.split('?')[0].replace(/\/$/, '');
      const parts = cleanUrl.split('/');
      return parts[parts.length - 1] || '';
  } catch (e) {
      return '';
  }
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

  try {
      const paginationElem = $('.pagination, .hpage, .navigation');
      if (paginationElem.length) {
        const current = paginationElem.find('.current, .page-numbers.current').text();
        pagination.currentPage = parseInt(current) || 1;
        
        const next = paginationElem.find('.next, a.next');
        pagination.hasNextPage = next.length > 0;
        if (pagination.hasNextPage) pagination.nextPage = pagination.currentPage + 1;

        const prev = paginationElem.find('.prev, a.prev');
        pagination.hasPrevPage = prev.length > 0;
        if (pagination.hasPrevPage) pagination.prevPage = pagination.currentPage - 1;

        const lastPageText = paginationElem.find('.page-numbers:not(.next):not(.prev)').last().text();
        pagination.totalPages = parseInt(lastPageText) || pagination.currentPage;
      }
  } catch (e) {
      console.warn('[Scraper Warning] Failed to parse pagination:', e.message);
  }
  return pagination;
};

// --- Route Handlers ---

export const getHome = async () => {
  const $ = await fetchHTML('/');
  
  const result = {
    recent: { href: "/samehadaku/recent", samehadakuUrl: `${BASE_URL}/anime-terbaru/`, animeList: [] },
    batch: { href: "/samehadaku/batch", samehadakuUrl: `${BASE_URL}/daftar-batch/`, batchList: [] },
    movie: { href: "/samehadaku/movies", samehadakuUrl: `${BASE_URL}/anime-movie/`, animeList: [] },
    top10: { href: "/samehadaku/popular", samehadakuUrl: BASE_URL, animeList: [] }
  };

  // 1. Recent Updates
  // Trying broad selectors for maximum compatibility
  let recentItems = $('.post-show ul li, .widget_recent_entries ul li, .latest-updates ul li, .animepost');
  
  recentItems.slice(0, 10).each((i, el) => {
    const title = $(el).find('.entry-title a, .animetitles, a.tip').first().text().trim();
    const url = $(el).find('a').attr('href');
    const animeId = extractId(url);
    
    let poster = $(el).find('img').attr('src');
    if (!poster || poster.includes('data:image')) poster = $(el).find('img').attr('data-src');

    let episodes = $(el).find('.dtla span:first-child, .episode').text().replace(/Episode/i, '').trim();
    let releasedOn = $(el).find('.dtla span:last-child, .postedon').text().replace(/Released on:?/i, '').trim();

    if (title && animeId && !url.includes('/page/')) {
        result.recent.animeList.push({
            title, poster, episodes, releasedOn, animeId,
            href: `/anime/samehadaku/anime/${animeId}`,
            samehadakuUrl: url
        });
    }
  });

  // 3. Top 10 / Popular
  // Fallback to whatever list is available if topten specific class is missing
  let topItems = $('.topten-animesu ul li, .widget_top_anime ul li');
  topItems.each((i, el) => {
    const title = $(el).find('.judul, h4, a').first().text().trim();
    const url = $(el).find('a').attr('href');
    const animeId = extractId(url);
    const poster = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
    const score = $(el).find('.rating, .score').text().trim();
    
    if (title && animeId) {
        result.top10.animeList.push({
            rank: i + 1, title, poster, score, animeId,
            href: `/anime/samehadaku/anime/${animeId}`,
            samehadakuUrl: url
        });
    }
  });

  return { data: result };
};

export const getRecent = async (req) => {
  const page = req.query.page || 1;
  const $ = await fetchHTML(`/anime-terbaru/page/${page}/`); 
  
  const animeList = [];
  $('.post-show ul li, .animepost').each((i, el) => {
    const title = $(el).find('.entry-title a, .animetitles').text().trim();
    const url = $(el).find('a').attr('href');
    const animeId = extractId(url);
    const poster = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
    const episodes = $(el).find('.dtla span:first-child, .episode').text().replace(/Episode/i, '').trim();
    const releasedOn = $(el).find('.dtla span:last-child, .postedon').text().replace(/Released on:?/i, '').trim();

    if (title && animeId) {
      animeList.push({
        title, poster, episodes, releasedOn, animeId,
        href: `/anime/samehadaku/anime/${animeId}`,
        samehadakuUrl: url
      });
    }
  });

  return { data: { animeList }, pagination: extractPagination($) };
};

export const getSearch = async (req) => {
  const { q, page = 1 } = req.query;
  const $ = await fetchHTML(`/page/${page}/`, { s: q });

  const animeList = [];
  $('.film-list .animepost, .animepost').each((i, el) => {
    const title = $(el).find('.animetitles').text().trim();
    const poster = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
    const type = $(el).find('.type').text().trim();
    const score = $(el).find('.score').text().trim();
    const status = $(el).find('.status').text().trim();
    const url = $(el).find('a').attr('href');
    const animeId = extractId(url);

    if (title && animeId) {
        animeList.push({
          title, poster, type, score, status, animeId,
          href: `/anime/samehadaku/anime/${animeId}`,
          samehadakuUrl: url
        });
    }
  });

  return { data: { animeList }, pagination: extractPagination($) };
};

export const getOngoing = async (req) => {
  const { page = 1 } = req.query; 
  // Note: order param sometimes causes issues on some WP themes, removed for stability
  const $ = await fetchHTML(`/daftar-anime-2/page/${page}/`, { status: 'Ongoing' }); 
  
  const animeList = [];
  $('.animepost').each((i, el) => {
    const title = $(el).find('.animetitles').text().trim();
    const poster = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
    const score = $(el).find('.score').text().trim();
    const type = $(el).find('.type').text().trim();
    const url = $(el).find('a').attr('href');
    const animeId = extractId(url);
    
    if (title && animeId) {
        animeList.push({
            title, poster, type, score, status: 'Ongoing', animeId,
            href: `/anime/samehadaku/anime/${animeId}`,
            samehadakuUrl: url,
            genreList: []
        });
    }
  });

  return { data: { animeList }, pagination: extractPagination($) };
};

export const getCompleted = async (req) => {
    const { page = 1 } = req.query;
    const $ = await fetchHTML(`/daftar-anime-2/page/${page}/`, { status: 'Completed' });
    
    const animeList = [];
    $('.animepost').each((i, el) => {
      const title = $(el).find('.animetitles').text().trim();
      const poster = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
      const score = $(el).find('.score').text().trim();
      const type = $(el).find('.type').text().trim();
      const url = $(el).find('a').attr('href');
      const animeId = extractId(url);
  
      if (title && animeId) {
          animeList.push({
              title, poster, type, score, status: 'Completed', animeId,
              href: `/anime/samehadaku/anime/${animeId}`,
              samehadakuUrl: url,
              genreList: []
          });
      }
    });
  
    return { data: { animeList }, pagination: extractPagination($) };
};

export const getPopular = async (req) => {
    const { page = 1 } = req.query;
    const $ = await fetchHTML(`/daftar-anime-2/page/${page}/`, { order: 'popular' });
    const animeList = [];
    $('.animepost').each((i, el) => {
        const title = $(el).find('.animetitles').text().trim();
        const poster = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
        const score = $(el).find('.score').text().trim();
        const type = $(el).find('.type').text().trim();
        const url = $(el).find('a').attr('href');
        const animeId = extractId(url);
        
        if (title && animeId) {
            animeList.push({ 
                title, poster, type, score, status: 'Ongoing', animeId, 
                href: `/anime/samehadaku/anime/${animeId}`, 
                samehadakuUrl: url,
                genreList: [] 
            });
        }
    });
    return { data: { animeList }, pagination: extractPagination($) };
};

export const getMovies = async (req) => {
    const { page = 1 } = req.query;
    const $ = await fetchHTML(`/anime-movie/page/${page}/`);
    const animeList = [];
    $('.animepost').each((i, el) => {
        const title = $(el).find('.animetitles').text().trim();
        const poster = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
        const score = $(el).find('.score').text().trim();
        const type = "Movie";
        const url = $(el).find('a').attr('href');
        const animeId = extractId(url);
        
        if (title && animeId) {
            animeList.push({ 
                title, poster, type, score, status: 'Completed', animeId, 
                href: `/anime/samehadaku/anime/${animeId}`, 
                samehadakuUrl: url,
                genreList: []
            });
        }
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
            const url = $(item).find('.entry-title a').attr('href');
            const animeId = extractId(url);
            const poster = $(item).find('.thumb img').attr('src') || $(item).find('img').attr('data-src');
            const score = $(item).find('.score').text().trim();
            const estimation = $(item).find('.time').text().trim();
            const type = "TV";
            const genres = $(item).find('.dtla span').last().text().trim();
            
            if (title && animeId) {
                animeList.push({ 
                    title, poster, type, score, estimation, genres, animeId, 
                    href: `/anime/samehadaku/anime/${animeId}`, 
                    samehadakuUrl: url 
                });
            }
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
        const url = $(el).attr('href');
        const genreId = extractId(url);
        if(title) genreList.push({ title, genreId, href: `/anime/samehadaku/genres/${genreId}`, samehadakuUrl: url });
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
        const poster = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
        const score = $(el).find('.score').text().trim();
        const type = $(el).find('.type').text().trim();
        const url = $(el).find('a').attr('href');
        const animeId = extractId(url);
        
        if (title && animeId) {
            animeList.push({ 
                title, poster, type, score, status: 'Completed', animeId, 
                href: `/anime/samehadaku/anime/${animeId}`, 
                samehadakuUrl: url,
                genreList: []
            });
        }
    });
    return { data: { animeList }, pagination: extractPagination($) };
};

export const getBatchList = async (req) => {
    const { page = 1 } = req.query;
    const $ = await fetchHTML(`/daftar-batch/page/${page}/`);
    const batchList = [];
    
    $('.post-show ul li, .animepost').each((i, el) => {
        const title = $(el).find('.entry-title a, .animetitles').text().trim();
        const url = $(el).find('a').attr('href');
        const batchId = extractId(url);
        const poster = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
        
        if (title && batchId) {
            batchList.push({ 
                title, poster, type: "TV", score: "N/A", status: "Completed", batchId, 
                href: `/anime/samehadaku/batch/${batchId}`, 
                samehadakuUrl: url,
                genreList: []
            });
        }
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
    let poster = $('.infox .thumb img').attr('src') || $('.infox img').attr('src');

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
        
        if (epTitle) {
            episodeList.push({ 
                title: epTitle, 
                episodeId, 
                href: `/anime/samehadaku/episode/${episodeId}`, 
                samehadakuUrl: epUrl 
            });
        }
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
    let poster = $('.thumb img').attr('src') || $('img.attachment-post-thumbnail').attr('src');
    
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
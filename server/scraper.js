import axios from 'axios';
import * as cheerio from 'cheerio';

// Base URL configuration
const BASE_URL = 'https://samehadaku.how';

// --- Helper Functions ---

const fetchHTML = async (endpoint, params = {}) => {
  const urlObj = new URL(endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`);
  Object.keys(params).forEach(key => {
    if (params[key]) urlObj.searchParams.append(key, params[key]);
  });
  
  const targetUrl = urlObj.toString();
  console.log(`[Scraper] Fetching via Axios: ${targetUrl}`);

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
        'Referer': 'https://www.google.com/',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      // Timeout 10 seconds
      timeout: 10000 
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Cloudflare/WAF Detection
    const title = $('title').text().toLowerCase();
    const bodyText = $('body').text().toLowerCase();
    
    if (title.includes('just a moment') || title.includes('security check') || title.includes('attention required') || title.includes('access denied')) {
        throw new Error('BLOCKED_CLOUDFLARE: The server returned a security challenge page instead of content.');
    }
    
    if (bodyText.includes('javascript is required') || bodyText.includes('enable javascript')) {
         throw new Error('BLOCKED_JS_REQUIRED: The site requires JavaScript execution which Axios cannot handle.');
    }

    return $;
  } catch (error) {
    if (error.response) {
      console.error(`[Scraper Error] HTTP ${error.response.status} for ${targetUrl}`);
    } else {
      console.error(`[Scraper Error] ${error.message}`);
    }
    throw error;
  }
};

const extractId = (url) => {
  if (!url) return '';
  try {
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/').filter(p => p);
      return parts.pop() || '';
  } catch (e) {
      // Fallback if url is relative or malformed
      return url.split('/').filter(part => part && part !== 'https:' && part !== 'http:' && part !== 'samehadaku.how' && part !== 'v1.samehadaku.how').pop();
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

  const paginationElem = $('.pagination, .hpage');
  if (paginationElem.length) {
    const current = paginationElem.find('.current, .page-numbers.current').text();
    pagination.currentPage = parseInt(current) || 1;
    
    const next = paginationElem.find('.next, a.next');
    pagination.hasNextPage = next.length > 0;
    if (pagination.hasNextPage) pagination.nextPage = pagination.currentPage + 1;

    const prev = paginationElem.find('.prev, a.prev');
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
  // Logic: Try multiple selector strategies
  let recentItems = $('.post-show ul li');
  if (recentItems.length === 0) recentItems = $('.widget_recent_entries ul li'); // Fallback 1
  if (recentItems.length === 0) recentItems = $('.latest-updates ul li'); // Fallback 2
  if (recentItems.length === 0) recentItems = $('div.post-show li'); // Fallback 3

  recentItems.each((i, el) => {
    const title = $(el).find('.entry-title a').text().trim() || $(el).find('a').attr('title');
    const samehadakuUrl = $(el).find('.entry-title a').attr('href') || $(el).find('a').attr('href');
    const animeId = extractId(samehadakuUrl);
    
    // Poster extraction strategies
    let poster = $(el).find('.thumb img').attr('src');
    if (!poster) poster = $(el).find('img').attr('src');
    if (!poster) poster = $(el).find('img').attr('data-src'); // Lazy load handling
    
    // Episodes extraction
    let episodes = $(el).find('.dtla span:first-of-type author').text().trim();
    if (!episodes) episodes = $(el).find('.dtla span:first-of-type').text().replace(/Episode/i, '').trim();
    if (!episodes) episodes = $(el).find('.episode').text().trim();

    let releasedOn = $(el).find('.dtla span:last-of-type').text().replace(/Released on:?/i, '').trim();
    if (!releasedOn) releasedOn = $(el).find('.postedon').text().trim();

    if (title && animeId) {
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
  let topItems = $('.topten-animesu ul li');
  if (topItems.length === 0) topItems = $('.widget_top_anime ul li');

  topItems.each((i, el) => {
    const title = $(el).find('.judul').text().trim() || $(el).find('h4').text().trim();
    const samehadakuUrl = $(el).find('a.series').attr('href') || $(el).find('a').attr('href');
    const animeId = extractId(samehadakuUrl);
    
    let poster = $(el).find('img').attr('src');
    if (!poster) poster = $(el).find('img').attr('data-src');

    const score = $(el).find('.rating').text().trim() || $(el).find('.score').text().trim();
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
  // Try primary selector first
  let items = $('.post-show ul li');
  if (items.length === 0) items = $('.animepost'); // Alternative view (grid)
  if (items.length === 0) items = $('article'); // Generic fallback

  items.each((i, el) => {
    const title = $(el).find('.entry-title a').text().trim() || $(el).find('.animetitles').text().trim();
    const samehadakuUrl = $(el).find('.entry-title a').attr('href') || $(el).find('a').attr('href');
    const animeId = extractId(samehadakuUrl);

    let poster = $(el).find('.thumb img').attr('src') || $(el).find('img').attr('src');
    if (!poster) poster = $(el).find('img').attr('data-src');

    let episodes = $(el).find('.dtla span:first-of-type author').text().trim();
    if (!episodes) episodes = $(el).find('.dtla span:first-of-type').text().replace(/Episode/i, '').trim();

    let releasedOn = $(el).find('.dtla span:last-of-type').text().replace(/Released on:?/i, '').trim();

    if (title && animeId) {
      animeList.push({
        title, poster, episodes, releasedOn, animeId,
        href: `/anime/samehadaku/anime/${animeId}`,
        samehadakuUrl
      });
    }
  });

  return { data: { animeList }, pagination: extractPagination($) };
};

export const getSearch = async (req) => {
  const { q, page = 1 } = req.query;
  const $ = await fetchHTML(`/page/${page}/`, { s: q });

  const animeList = [];
  $('.film-list .animepost').each((i, el) => {
    const title = $(el).find('.animetitles').text().trim();
    let poster = $(el).find('img').attr('src');
    if (!poster) poster = $(el).find('img').attr('data-src');

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
    let poster = $(el).find('img').attr('src');
    if (!poster) poster = $(el).find('img').attr('data-src');

    const score = $(el).find('.score').text().trim();
    const type = $(el).find('.type').text().trim();
    const samehadakuUrl = $(el).find('a').attr('href');
    const animeId = extractId(samehadakuUrl);
    
    if (title) {
        animeList.push({
            title, poster, type, score, status: 'Ongoing', animeId,
            href: `/anime/samehadaku/anime/${animeId}`,
            samehadakuUrl,
            genreList: []
        });
    }
  });

  return { data: { animeList }, pagination: extractPagination($) };
};

export const getCompleted = async (req) => {
    const { page = 1, order = 'latest' } = req.query;
    const $ = await fetchHTML(`/daftar-anime-2/page/${page}/`, { status: 'Completed', order });
    
    const animeList = [];
    $('.animepost').each((i, el) => {
      const title = $(el).find('.animetitles').text().trim();
      let poster = $(el).find('img').attr('src');
      if (!poster) poster = $(el).find('img').attr('data-src');

      const score = $(el).find('.score').text().trim();
      const type = $(el).find('.type').text().trim();
      const samehadakuUrl = $(el).find('a').attr('href');
      const animeId = extractId(samehadakuUrl);
  
      if (title) {
          animeList.push({
              title, poster, type, score, status: 'Completed', animeId,
              href: `/anime/samehadaku/anime/${animeId}`,
              samehadakuUrl,
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
        let poster = $(el).find('img').attr('src');
        if (!poster) poster = $(el).find('img').attr('data-src');

        const score = $(el).find('.score').text().trim();
        const type = $(el).find('.type').text().trim();
        const samehadakuUrl = $(el).find('a').attr('href');
        const animeId = extractId(samehadakuUrl);
        const status = "Ongoing"; 
        
        if (title) {
            animeList.push({ 
                title, poster, type, score, status, animeId, 
                href: `/anime/samehadaku/anime/${animeId}`, 
                samehadakuUrl,
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
        let poster = $(el).find('img').attr('src');
        if (!poster) poster = $(el).find('img').attr('data-src');

        const score = $(el).find('.score').text().trim();
        const type = "Movie";
        const samehadakuUrl = $(el).find('a').attr('href');
        const animeId = extractId(samehadakuUrl);
        
        if (title) {
            animeList.push({ 
                title, poster, type, score, status: 'Completed', animeId, 
                href: `/anime/samehadaku/anime/${animeId}`, 
                samehadakuUrl,
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
            const samehadakuUrl = $(item).find('.entry-title a').attr('href');
            const animeId = extractId(samehadakuUrl);
            let poster = $(item).find('.thumb img').attr('src');
            if (!poster) poster = $(item).find('img').attr('data-src');

            const score = $(item).find('.score').text().trim();
            const estimation = $(item).find('.time').text().trim();
            const type = "TV";
            const genres = $(item).find('.dtla span').last().text().trim();
            
            if (title) {
                animeList.push({ 
                    title, poster, type, score, estimation, genres, animeId, 
                    href: `/anime/samehadaku/anime/${animeId}`, 
                    samehadakuUrl 
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
        const samehadakuUrl = $(el).attr('href');
        const genreId = extractId(samehadakuUrl);
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
        let poster = $(el).find('img').attr('src');
        if (!poster) poster = $(el).find('img').attr('data-src');

        const score = $(el).find('.score').text().trim();
        const type = $(el).find('.type').text().trim();
        const samehadakuUrl = $(el).find('a').attr('href');
        const animeId = extractId(samehadakuUrl);
        const status = "Completed";
        
        if (title) {
            animeList.push({ 
                title, poster, type, score, status, animeId, 
                href: `/anime/samehadaku/anime/${animeId}`, 
                samehadakuUrl,
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
    
    // Fallback selectors for batch list
    let items = $('.post-show ul li');
    if (items.length === 0) items = $('.animepost');

    items.each((i, el) => {
        const title = $(el).find('.entry-title a').text().trim() || $(el).find('.animetitles').text().trim();
        const samehadakuUrl = $(el).find('.entry-title a').attr('href') || $(el).find('a').attr('href');
        const batchId = extractId(samehadakuUrl);
        let poster = $(el).find('.thumb img').attr('src') || $(el).find('img').attr('src');
        if (!poster) poster = $(el).find('img').attr('data-src');
        
        if (title) {
            batchList.push({ 
                title, poster, type: "TV", score: "N/A", status: "Completed", batchId, 
                href: `/anime/samehadaku/batch/${batchId}`, 
                samehadakuUrl,
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
    let poster = $('.infox .thumb img').attr('src');
    if (!poster) poster = $('.infox img').attr('src');

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
    let poster = $('.thumb img').attr('src');
    if (!poster) poster = $('img.attachment-post-thumbnail').attr('src');
    
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
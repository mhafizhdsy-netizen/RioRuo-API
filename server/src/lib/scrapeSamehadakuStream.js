import { load } from 'cheerio';

const extractSlugFromUrl = (url) => {
  if (!url) return '';
  const urlPath = url.replace(/https?:\/\/[^\/]+/, ''); 
  const match = urlPath.match(/\/([^\/]+)\/?$/); 
  return match ? match[1] : '';
};

const scrapeSamehadakuStream = (html) => {
  const $ = load(html);
  
  // Title
  const title = $('.entry-title[itemprop="name"]').text().trim();
  
  // Series Slug
  const seriesLink = $('.year a[href*="/anime/"]').attr('href');
  let seriesSlug = '';
  if (seriesLink) {
    const match = seriesLink.match(/\/anime\/([^\/]+)\//);
    seriesSlug = match ? match[1] : '';
  }

  // Current Episode info
  const currentEpisode = {
    number: $('meta[itemprop="episodeNumber"]').attr('content') || '',
    type: $('.epx').text().trim() || '',
    releaseDate: $('.updated').text().trim() || ''
  };

  // --- Start Updated getServerOptions Logic ---
  const streamServers = [];
  $('.mirror option').each(function() {
    const $this = $(this);
    const value = $this.attr('value');
    const name = $this.text().trim();
    
    if (value && value !== '') {
      let decodedEmbed = '';
      let embedUrl = '';
      
      try {
        // Decode base64
        decodedEmbed = Buffer.from(value, 'base64').toString('utf-8');
        
        // Extract src URL from decoded HTML
        // Pattern: src="URL" or src='URL'
        const srcMatch = decodedEmbed.match(/src=["']([^"']+)["']/i);
        if (srcMatch && srcMatch[1]) {
          embedUrl = srcMatch[1];
        }
        
        // Alternative pattern: src=URL (without quotes, until space or >)
        if (!embedUrl) {
          const srcMatchAlt = decodedEmbed.match(/src=([^\s>]+)/i);
          if (srcMatchAlt && srcMatchAlt[1]) {
            embedUrl = srcMatchAlt[1].replace(/["']/g, ''); // Remove any quotes
          }
        }
        
      } catch (e) {
        decodedEmbed = 'Unable to decode';
        embedUrl = '';
      }
      
      streamServers.push({
        name,
        encodedValue: value,
        decodedEmbed,
        embedUrl, // Direct embed URL extracted from src
        dataIndex: $this.attr('data-index') || ''
      });
    }
  });
  // --- End Updated getServerOptions Logic ---

  // Main Embed
  const mainEmbed = $('#embed_holder iframe').attr('src') || '';

  // Episode List
  const episodeList = [];
  $('.episodelist ul li').each(function() {
    const $link = $(this).find('a');
    const $playinfo = $(this).find('.playinfo');
    const $thumb = $(this).find('.thumbnel img');
    const url = $link.attr('href') || '';
    
    episodeList.push({
      title: $playinfo.find('h3').text().trim(),
      episode: $playinfo.find('span').text().trim(),
      url: url,
      slug: extractSlugFromUrl(url),
      thumbnail: $thumb.attr('src') || '',
      dataId: $(this).attr('data-id') || ''
    });
  });

  // Pagination
  const prevLink = $('.naveps .nvs a[rel="prev"]');
  const nextLink = $('.naveps .nvs a[rel="next"]');
  const pagination = {
    hasPrev: prevLink.length > 0,
    prevUrl: prevLink.attr('href') || null,
    hasNext: nextLink.length > 0,
    nextUrl: nextLink.attr('href') || null
  };

  // getDownloadUrl Logic
  let downloadUrl = '';
  const $downloadLinkIcon = $('.iconx .icol a, .iconx a').filter(function() {
    const $this = $(this);
    const hasDownloadIcon = $this.find('i.fa-cloud-download-alt').length > 0 || 
                            $this.parent().find('i.fa-cloud-download-alt').length > 0;
    return hasDownloadIcon;
  });
  if ($downloadLinkIcon.length > 0) {
    downloadUrl = $downloadLinkIcon.attr('href') || '';
  }
  if (!downloadUrl) {
    $('.iconx a').each(function() {
      const text = $(this).text().trim().toLowerCase();
      const spanText = $(this).find('span').text().trim().toLowerCase();
      if (text.includes('Download') || spanText.includes('Download')) {
        downloadUrl = $(this).attr('href');
        return false;
      }
    });
  }
  if (!downloadUrl) {
    $('.iconx a[target="_blank"]').each(function() {
      const $parent = $(this).parent();
      if (!$parent.hasClass('expand') && !$parent.hasClass('light')) {
        downloadUrl = $(this).attr('href');
        return false;
      }
    });
  }

  // getRecommendedAnime Logic
  const recommendedAnime = [];
  $('.bixbox').each(function() {
    const headingText = $(this).find('.releases h3').text().trim();
    if (headingText.toLowerCase().includes('recommended')) {
      $(this).find('.listupd .bs').each(function() {
        const $bsx = $(this).find('.bsx');
        const $link = $bsx.find('a.tip');
        const $limit = $bsx.find('.limit');
        const $tt = $bsx.find('.tt');
        const $img = $limit.find('img');
        const url = $link.attr('href') || '';
        
        let rSlug = '';
        if (url) {
          const rMatch = url.replace(/https?:\/\/[^\/]+/, '').match(/\/anime\/([^\/]+)\/?$/);
          rSlug = rMatch ? rMatch[1] : '';
        }
        
        recommendedAnime.push({
          title: $tt.find('h2').text().trim(),
          url: url,
          slug: rSlug,
          thumbnail: $img.attr('src') || '',
          status: $limit.find('.status').text().trim(),
          type: $limit.find('.typez').text().trim(),
          episodeInfo: $limit.find('.bt .epx').text().trim(),
          subtitle: $limit.find('.bt .sb').text().trim(),
          rel: $link.attr('rel') || '',
          alt: $img.attr('alt') || '',
          width: $img.attr('width') || '',
          height: $img.attr('height') || ''
        });
      });
    }
  });

  // Series Details
  const studios = [];
  $('.spe span b:contains("Studio:")').parent().find('a').each(function() {
    studios.push({ name: $(this).text().trim(), url: $(this).attr('href') || '' });
  });
  
  const genres = [];
  $('.genxed a').each(function() {
    genres.push({ name: $(this).text().trim(), url: $(this).attr('href') || '' });
  });

  const metadata = {};
  $('.spe span').each(function() {
    const text = $(this).text().trim();
    const $b = $(this).find('b');
    if ($b.length > 0) {
      const key = $b.text().replace(':', '').trim();
      let value = text.replace($b.text(), '').trim();
      if ($(this).find('a').length > 0) {
        const links = [];
        $(this).find('a').each(function() { links.push($(this).text().trim()); });
        value = links.join(', ');
      }
      metadata[key] = value;
    }
  });

  const seriesInfo = {
    title: $('.single-info .infox h2[itemprop="partOfSeries"]').text().trim(),
    poster: $('.single-info .thumb img').attr('src') || '',
    rating: $('.single-info .rating strong').text().trim(),
    status: metadata['Status'] || '',
    type: metadata['Type'] || '',
    episodes: metadata['Episodes'] || '',
    released: metadata['Released'] || '',
    studios,
    genres,
    description: $('.desc.mindes').clone().children('.colap').remove().end().text().trim()
  };

  return {
    title,
    seriesSlug,
    currentEpisode,
    mainEmbed,
    streamServers,
    downloadUrl,
    episodeList,
    pagination,
    seriesInfo,
    recommendedAnime
  };
};

export default scrapeSamehadakuStream;
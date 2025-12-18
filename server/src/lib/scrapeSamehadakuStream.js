import { load } from 'cheerio';

const extractSlugFromUrl = (url) => {
  if (!url) return null;
  // Menghilangkan protocol, domain, dan slashes di awal/akhir untuk mendapatkan slug murni
  return url.replace(/https?:\/\/[^\/]+/, '').replace(/^\/|\/$/g, '');
};

const scrapeSamehadakuStream = (html) => {
  const $ = load(html);
  
  // Title
  const title = $('.entry-title[itemprop="name"]').text().trim();
  
  // Series Slug (untuk key "slug" di dalam streamndownload)
  const seriesLink = $('.year a[href*="/anime/"]').attr('href');
  let seriesSlug = '';
  if (seriesLink) {
    const match = seriesLink.match(/\/anime\/([^\/]+)\//);
    seriesSlug = match ? match[1] : '';
  }

  // Current Episode info - Removed 'type'
  const currentEpisode = {
    number: $('meta[itemprop="episodeNumber"]').attr('content') || '',
    releaseDate: $('.updated').first().text().replace(/Updated on:?/i, '').trim() || ''
  };

  // Stream Options - Sanitized keys
  const streamServers = [];
  $('.mirror option').each(function() {
    const $this = $(this);
    const value = $this.attr('value');
    const name = $this.text().trim();
    
    if (value && value !== '') {
      let embedUrl = '';
      try {
        const decodedEmbed = Buffer.from(value, 'base64').toString('utf-8');
        const srcMatch = decodedEmbed.match(/src=["']([^"']+)["']/i);
        if (srcMatch && srcMatch[1]) {
          embedUrl = srcMatch[1];
        }
        if (!embedUrl) {
          const srcMatchAlt = decodedEmbed.match(/src=([^\s>]+)/i);
          if (srcMatchAlt && srcMatchAlt[1]) {
            embedUrl = srcMatchAlt[1].replace(/["']/g, '');
          }
        }
      } catch (e) {
        embedUrl = '';
      }
      
      streamServers.push({
        name,
        embedUrl
      });
    }
  });

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

  // Pagination - Updated to nextSlug and prevSlug
  const prevLink = $('.naveps .nvs a[rel="prev"]');
  const nextLink = $('.naveps .nvs a[rel="next"]');
  const pagination = {
    hasPrev: prevLink.length > 0,
    prevSlug: prevLink.attr('href') ? extractSlugFromUrl(prevLink.attr('href')) : null,
    hasNext: nextLink.length > 0,
    nextSlug: nextLink.attr('href') ? extractSlugFromUrl(nextLink.attr('href')) : null
  };

  // Improved Download URL Logic
  let downloadUrl = '';
  const iconxLink = $('.iconx a[aria-label*="ownload" i]').first().attr('href');
  if (iconxLink) {
    downloadUrl = iconxLink;
  }
  if (!downloadUrl) {
    $('.iconx a').each(function() {
      const text = $(this).text().toLowerCase();
      if (text.includes('download')) {
        downloadUrl = $(this).attr('href');
        if (downloadUrl) return false;
      }
    });
  }
  if (!downloadUrl) {
    downloadUrl = $('.download-eps a, .list_dl a, .dl-info a').first().attr('href') || '';
  }
  if (!downloadUrl) {
    downloadUrl = $('a[aria-label*="ownload" i]').first().attr('href') || '';
  }

  // Recommended Anime Logic - Sanitized keys
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
        
        recommendedAnime.push({
          title: $tt.find('h2').text().trim(),
          url: url,
          slug: extractSlugFromUrl(url),
          thumbnail: $img.attr('src') || '',
          status: $limit.find('.status').text().trim(),
          type: $limit.find('.typez').text().trim(),
          episodeInfo: $limit.find('.bt .epx').text().trim(),
          subtitle: $limit.find('.bt .sb').text().trim()
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

  // Constructing final object with streamndownload group
  return {
    streamndownload: {
      title,
      slug: seriesSlug,
      currentEpisode,
      mainEmbed,
      streamServers,
      downloadUrl
    },
    episodeList,
    pagination,
    seriesInfo,
    recommendedAnime
  };
};

export default scrapeSamehadakuStream;
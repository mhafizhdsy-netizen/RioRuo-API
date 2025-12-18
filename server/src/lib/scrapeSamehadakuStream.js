
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

  // Stream Options
  const streamServers = [];
  $('.mirror option').each(function() {
    const value = $(this).attr('value');
    const name = $(this).text().trim();
    if (value && value !== '') {
      let decodedEmbed = '';
      try {
        decodedEmbed = Buffer.from(value, 'base64').toString('utf-8');
      } catch (e) {
        decodedEmbed = 'Unable to decode';
      }
      streamServers.push({
        name,
        encodedValue: value,
        decodedEmbed,
        dataIndex: $(this).attr('data-index') || ''
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

  // Pagination
  const prevLink = $('.naveps .nvs a[rel="prev"]');
  const nextLink = $('.naveps .nvs a[rel="next"]');
  const pagination = {
    hasPrev: prevLink.length > 0,
    prevUrl: prevLink.attr('href') || null,
    hasNext: nextLink.length > 0,
    nextUrl: nextLink.attr('href') || null
  };

  // Download URL
  let downloadUrl = '';
  const downloadIcon = $('.iconx a:has(i.fa-cloud-download-alt)').attr('href');
  if (downloadIcon) downloadUrl = downloadIcon;
  if (!downloadUrl) {
    $('.iconx a').each(function() {
      const text = $(this).text().trim();
      if (text.toLowerCase().includes('download')) {
        downloadUrl = $(this).attr('href');
        return false;
      }
    });
  }

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
    seriesInfo
  };
};

export default scrapeSamehadakuStream;

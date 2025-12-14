import { load } from 'cheerio';

const scrapeAnimeEpisodes = (html) => {
  const result = [];
  let $ = load(html);
  $ = load(`<div> ${$('.episodelist').toString()}</div>`);
  const episodeList = $('.episodelist:nth-child(2) ul').html()?.split('</li>').filter(item => item.trim() !== '').map(item => `${item}</li>`);

  if (!episodeList) return undefined;

  for (const episode of episodeList) {
    const $ = load(episode);
    result.unshift({
      episode: $('li span:first a')?.text(),
      slug: $('li span:first a')?.attr('href')?.replace(/^https:\/\/otakudesu\.is\/episode\//, ''), // Updated regex for otakudesu.is
      otakudesu_url: $('li span:first a')?.attr('href')
    });
  }

  return result;
};

export default scrapeAnimeEpisodes;
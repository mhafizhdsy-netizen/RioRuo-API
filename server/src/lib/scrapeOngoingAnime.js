import { load } from 'cheerio';

const scrapeOngoingAnime = (html) => {
  const result = [];
  const animes = html.split('</li>')
    .filter(item => item.trim() !== '')
    .map(item => `${item}</li>`);

  animes.forEach(anime => {
    const $ = load(anime);

    result.push({
      title: $('.detpost .thumb .thumbz .jdlflm').text(),
      slug: $('.detpost .thumb a').attr('href')?.replace(/^https:\/\/otakudesu\.is\/anime\//, ''), // Updated regex for otakudesu.is
      poster: $('.detpost .thumb .thumbz img').attr('src'),
      current_episode: $('.detpost .epz').text().trim(),
      release_day: $('.detpost .epztipe').text().trim(),
      newest_release_date: $('.detpost .newnime').text(),
      otakudesu_url: $('.detpost .thumb a').attr('href')
    });
  });

  return result;
};

export default scrapeOngoingAnime;
import { load } from 'cheerio';

const scrapeCompleteAnime = (html) => {
  const result = [];
  const animes = html.split('</li>')
    .filter(item => item.trim() !== '')
    .map(item => `${item}</li>`);

  animes.forEach(anime => {
    const $ = load(anime);

    result.push({
      title: $('.detpost .thumb .thumbz .jdlflm').text(),
      slug: $('.detpost .thumb a').attr('href')?.replace(/^https:\/\/otakudesu\.best\/anime\//, ''), // Updated regex for otakudesu.best
      poster: $('.detpost .thumb .thumbz img').attr('src'),
      episode_count: $('.detpost .epz').text().trim().replace(' Episode', ''),
      rating: $('.detpost .epztipe').text().trim(),
      last_release_date: $('.detpost .newnime').text(),
      otakudesu_url: $('.detpost .thumb a').attr('href')
    });
  });

  return result;
};

export default scrapeCompleteAnime;
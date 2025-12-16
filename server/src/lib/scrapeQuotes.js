
import { load } from 'cheerio';

const scrapeQuotes = (html) => {
  const $ = load(html);
  const quotes = [];

  $('.quote').each((index, element) => {
    const quoteElement = $(element);

    // Dapatkan teks quote, lalu bersihkan dari karakter yang tidak diinginkan
    const text = quoteElement.find('.quoteText').text().trim().split('―')[0].trim();

    // Dapatkan nama penulis
    const author = quoteElement.find('.authorOrTitle').text().trim();

    // Dapatkan tag-tag yang terkait
    const tags = [];
    quoteElement.find('.quoteFooter .greyText a').each((i, el) => {
      tags.push($(el).text().trim());
    });

    // Dapatkan jumlah "likes"
    const likesText = quoteElement.find('.right a').text();
    const likes = parseInt(likesText.match(/\d+/) ? likesText.match(/\d+/)[0] : '0');

    // Masukkan data yang sudah di-scrape ke dalam array
    if (text && author) {
      quotes.push({
        text,
        author,
        tags,
        likes,
      });
    }
  });

  return quotes;
};

export default scrapeQuotes;

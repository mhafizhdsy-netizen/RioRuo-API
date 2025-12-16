// routes/quotes.js (Debugging Mode)
import axios from 'axios';
import scrapeQuotes from '../lib/scrapeQuotes.js';

const getQuotes = async (req, res) => {
  console.log("🔍 [DEBUG] Fungsi getQuotes dipanggil.");
  console.log("🔍 [DEBUG] Query params:", req.query);

  try {
    console.log("🔍 [DEBUG] Memulai blok try...");
    const page = req.query.page || 1;
    console.log(`🔍 [DEBUG] Halaman: ${page}`);

    const url = `https://www.goodreads.com/quotes?page=${page}`;
    console.log(`🔍 [DEBUG] URL yang akan di-scrape: ${url}`);
    console.log("🔍 [DEBUG] Mengirim request ke Goodreads...");

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    console.log("🔍 [DEBUG] Request ke Goodreads berhasil. Menerima data HTML.");
    console.log("🔍 [DEBUG] Memanggil fungsi scrapeQuotes...");

    const quotes = scrapeQuotes(data);

    console.log(`🔍 [DEBUG] Scraping selesai. Dapat ${quotes.length} quotes.`);
    console.log("🔍 [DEBUG] Mengirim respons 200 ke klien.");

    res.status(200).json({
      page: parseInt(page),
      source: url,
      quotes,
    });

  } catch (error) {
    console.error("❌ [ERROR] Terjadi error di dalam fungsi getQuotes!");
    console.error("❌ [ERROR] Detail Error:", error.message);
    // Jika error dari axios, kita bisa lihat statusnya
    if (error.response) {
      console.error("❌ [ERROR] Status:", error.response.status);
      console.error("❌ [ERROR] Headers:", error.response.headers);
    }
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses data.' });
  }
};

const getQuotesByTag = async (req, res) => {
  console.log("🔍 [DEBUG] Fungsi getQuotesByTag dipanggil.");
  // ... Anda bisa menambahkan log serupa di sini jika perlu
  res.status(200).json({ message: "Debug untuk getQuotesByTag" });
};

module.exports = {
  getQuotes,
  getQuotesByTag
};


import { load } from "cheerio";
import { baseUrl, baseApi } from "../constants/urls.js";
import AxiosService from "../lib/axiosService.js";

const replaceMangaPage = "https://komiku.org/manga/";

const getMangaPage = async (page = 1) => {
  const pagenumber = page.toString();
  const path = pagenumber === "1" ? "/manga/" : `/manga/page/${pagenumber}/`;
  const url = baseApi + path;

  try {
    const response = await AxiosService(url);
    const $ = load(response.data);
    const element = $(".bge");
    let manga_list = [];

    element.each((idx, el) => {
      const title = $(el).find(".kan > a").find("h3").text().trim();
      const endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "");
      const type = $(el).find(".bgei > a").find(".tpe1_inf > b").text();
      const updated_on = $(el).find(".kan > .judul2").text().split("|")[1]?.trim();
      const thumb = $(el).find(".bgei > a").find("img").attr("src");
      const chapter = $(el).find("div.kan > div:nth-child(5) > a > span:nth-child(2)").text();
      
      manga_list.push({
        title,
        thumb,
        type,
        updated_on,
        endpoint,
        chapter,
      });
    });
    return manga_list;
  } catch (err) {
    throw err;
  }
};

const getPopularManga = async (page = 1) => {
  const pagenumber = page.toString();
  const path = pagenumber === "1" ? `/other/rekomendasi/` : `/other/rekomendasi/page/${pagenumber}/`;
  const url = baseApi + path;

  try {
    const response = await AxiosService(url);
    const $ = load(response.data);
    const element = $(".bge");
    let manga_list = [];
    
    element.each((idx, el) => {
      const title = $(el).find(".kan").find("h3").text().trim();
      const endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "").replace("/manga/", "");
      const type = $(el).find("div.bgei > a > div.tpe1_inf > b").text();
      const thumb = $(el).find("div.bgei > a > img").attr("src");
      const sortDesc = $(el).find("div.kan > p").text().trim();
      const upload_on = $(el).find("div.kan > span.judul2").text().split("•")[1]?.trim();
      
      manga_list.push({
        title,
        type,
        thumb,
        endpoint,
        upload_on,
        sortDesc
      });
    });
    return manga_list;
  } catch (error) {
    throw error;
  }
};

const getMangaDetail = async (slug) => {
  try {
    const response = await AxiosService(`/manga/${slug}`);
    const $ = load(response.data);
    const element = $(".perapih");
    let genre_list = [];
    let chapter = [];
    const obj = {};

    const getMeta = element.find(".inftable > tbody").first();
    obj.title = $("#Judul > h1").text().trim();
    obj.type = $("tr:nth-child(2) > td:nth-child(2)").find("b").text();
    obj.author = $("#Informasi > table > tbody > tr:nth-child(4) > td:nth-child(2)").text().trim();
    obj.status = $(getMeta).children().eq(4).find("td:nth-child(2)").text();
    obj.manga_endpoint = slug;
    obj.thumb = element.find(".ims > img").attr("src");

    element.find(".genre > li").each((idx, el) => {
      let genre_name = $(el).find("a").text().trim();
      genre_list.push({ genre_name });
    });

    obj.genre_list = genre_list;

    const getSinopsis = element.find("#Sinopsis").first();
    obj.synopsis = $(getSinopsis).find("p").text().trim();

    $("#Daftar_Chapter > tbody").find("tr").each((index, el) => {
        let chapter_title = $(el).find("a").text().trim();
        let chapter_endpoint = $(el).find("a").attr("href");
        if (chapter_endpoint !== undefined) {
          const rep = chapter_endpoint.replace("/ch/", "");
          chapter.push({
            chapter_title,
            chapter_endpoint: rep,
          });
        }
    });
    obj.chapter = chapter;
    return obj;
  } catch (error) {
    throw error;
  }
};

const searchManga = async (query) => {
  const url = baseApi + `?post_type=manga&s=${query}`;
  try {
    const response = await AxiosService(url);
    const $ = load(response.data);
    const element = $(".bge");
    let manga_list = [];
    
    element.each((idx, el) => {
      const endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "").replace("/manga/", "");
      const thumb = $(el).find("div.bgei > a > img").attr("data-src");
      const type = $(el).find("div.bgei > a > div.tpe1_inf > b").text();
      const title = $(el).find(".kan").find("h3").text().trim();
      const updated_on = $(el).find("div.kan > p").text().split(".")[0].trim();
      
      manga_list.push({
        title,
        thumb,
        type,
        endpoint,
        updated_on,
      });
    });
    return manga_list;
  } catch (error) {
    throw error;
  }
};

const getGenres = async () => {
  try {
    const response = await AxiosService("/");
    const $ = load(response.data);
    let list_genre = [];
    
    $("#Filter > form > select:nth-child(4)").find("option").each((idx, el) => {
        if ($(el).text() !== "Genre 1") {
          const endpoint = $(el).text().trim().split(" ")[0].toLowerCase();
          list_genre.push({
            genre_name: $(el).text().trim(),
            endpoint,
          });
        }
    });
    return list_genre;
  } catch (error) {
    throw error;
  }
};

const getAnimeByGenre = async (slug, page = 1) => {
  const pagenumber = page.toString();
  const path = pagenumber === "1"
      ? `/genre/${slug}/?orderby=modified&genre2&status&category_name`
      : `/manga/page/${pagenumber}/?orderby=modified&category_name&genre=${slug}&genre2&status`;
  const url = baseApi + path;

  try {
    const response = await AxiosService(url);
    const $ = load(response.data);
    const element = $(".bge");
    let manga_list = [];
    
    element.each((idx, el) => {
      const title = $(el).find(".kan").find("h3").text().trim();
      const endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "");
      const type = $(el).find("div.bgei > a > div").find("b").text();
      const thumb = $(el).find("div.bgei > a > img").attr("src");
      
      manga_list.push({ title, type, thumb, endpoint });
    });
    return manga_list;
  } catch (error) {
    throw error;
  }
};

const getRecommended = async (page = 1) => {
  const pagenumber = page.toString();
  const path = pagenumber === "1" ? `/other/hot/` : `/other/hot/page/${pagenumber}/`;
  const url = baseApi + path;
  
  try {
    const response = await AxiosService(url);
    const $ = load(response.data);
    const element = $(".bge");
    let manga_list = [];
    
    element.each((idx, el) => {
      const title = $(el).find("div.kan > a > h3").text().trim();
      const thumb = $(el).find("div.bgei > a > img").attr("src");
      const endpoint = $(el).find("div.kan > a").attr("href").replace("/manga/", "").replace(replaceMangaPage, "");
      // Note: Chapter and type extraction was missing in source txt for recommended, adding basic info
      manga_list.push({ title, thumb, endpoint });
    });
    return manga_list;
  } catch (error) {
    throw error;
  }
};

const getManhuaManhwa = async (page = 1, type) => {
  const pagenumber = page.toString();
  const path = pagenumber === "1"
      ? `/manga/?orderby=&category_name=${type}&genre=&genre2=&status=`
      : `/manga/page/${pagenumber}/?orderby&category_name=${type}&genre&genre2&status`;
  const url = baseApi + path;
  
  try {
    const response = await AxiosService(url);
    const $ = load(response.data);
    const element = $(".bge");
    let manga_list = [];

    element.each((idx, el) => {
      const title = $(el).find(".kan > a").find("h3").text().trim();
      const endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "");
      const typeText = $(el).find(".bgei > a").find(".tpe1_inf > b").text().trim();
      const updated_on = $(el).find(".kan > span").text().split("• ")[1]?.trim();
      const thumb = $(el).find(".bgei > a").find("img").attr("src");
      const chapter = $(el).find("div.kan > div:nth-child(5) > a > span:nth-child(2)").text();
      
      manga_list.push({
        title,
        thumb,
        type: typeText,
        updated_on,
        endpoint,
        chapter,
      });
    });
    return manga_list;
  } catch (error) {
    throw error;
  }
};

const getChapter = async (slug) => {
  try {
    const response = await AxiosService(`${slug}/`);
    const $ = load(response.data);
    const content = $("#article");
    let chapter_image = [];
    const obj = {};
    
    obj.chapter_endpoint = slug + "/";
    obj.chapter_name = slug.split('-').join(' ').trim();
    obj.title = $('#Judul > header > p > a > b').text().trim();

    const getTitlePages = content.find(".dsk2");
    getTitlePages.filter(() => {
      obj.title = $(getTitlePages).find("h1").text().replace("Komik ", "");
    });

    const getPages = $('#Baca_Komik > img');
    obj.chapter_pages = getPages.length;
    
    getPages.each((i, el) => {
      chapter_image.push({
        chapter_image_link: $(el).attr("src").replace('i0.wp.com/',''),
        image_number: i + 1,
      });
    });
    
    obj.chapter_image = chapter_image;
    return obj;
  } catch (error) {
    throw error;
  }
};

export default {
    getMangaPage,
    getPopularManga,
    getMangaDetail,
    searchManga,
    getGenres,
    getAnimeByGenre,
    getRecommended,
    getManhuaManhwa,
    getChapter
};

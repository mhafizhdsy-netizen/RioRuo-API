
import { ApiEndpoint } from '../src/types/types.ts';

// Determine Base URL based on environment
export const BASE_URL = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.MODE === 'development') 
  ? 'http://localhost:3000' 
  : ''; // Use relative path in production (same domain)

async function fetchFromApi<T>(endpoint: string, params?: Record<string, string>, extraQueryParams?: Record<string, string>): Promise<T> {
  const fullApiPath = endpoint;
  const url = new URL(`${BASE_URL}${fullApiPath}`, window.location.origin);
  
  // URL path params (e.g., :location) should be handled by caller before string replacement if using this func generic,
  // but here we primarily use params for search params or rely on replacement before calling.
  
  if (params) {
    Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
    });
  }

  if (extraQueryParams) {
      Object.keys(extraQueryParams).forEach(key => {
          if (extraQueryParams[key]) url.searchParams.append(key, extraQueryParams[key]);
      });
  }

  const res = await fetch(url.toString());
  
  if (!res.ok) {
      let errorMessage = `HTTP Error: ${res.status} ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData.message) errorMessage = errorData.message;
      } catch (e) { 
        // ignore json parse error
      }
      throw new Error(errorMessage);
  }
  
  // Handle Content-Types
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
      return await res.json();
  } else if (contentType && contentType.includes("image")) {
      // For images, we can't display blob in JSON console properly, so we return a descriptive object
      return { 
          status: 'OK', 
          message: 'Binary Image Data Returned', 
          type: contentType,
          url: url.toString(),
          hint: 'This endpoint returns a binary image file. In a real app, use <img src="..." />.'
      } as any;
  } else {
      // Assume text (like for ASCII)
      const text = await res.text();
      // Wrap text in JSON so ConsoleOutput can display it nicely
      return { data: text } as any;
  }
}

export const apiService = {
  getHome: () => fetchFromApi(ApiEndpoint.HOME),
  getSearch: (keyword: string) => fetchFromApi(ApiEndpoint.SEARCH.replace(':keyword', keyword)),
  getOngoing: (page = 1) => fetchFromApi(ApiEndpoint.ONGOING.replace(':page?', page.toString())),
  getCompleted: (page = 1) => fetchFromApi(ApiEndpoint.COMPLETED.replace(':page?', page.toString())),
  getGenres: () => fetchFromApi(ApiEndpoint.GENRES),
  getGenreDetail: (slug: string, page = 1) => fetchFromApi(ApiEndpoint.GENRE_DETAIL.replace(':slug', slug).replace(':page?', page.toString())),
  getBatchDetail: (slug: string) => fetchFromApi(ApiEndpoint.BATCH_DETAIL.replace(':slug', slug)),
  getAnimeDetail: (slug: string) => fetchFromApi(ApiEndpoint.ANIME_DETAIL.replace(':slug', slug)),
  getAnimeEpisodes: (slug: string) => fetchFromApi(ApiEndpoint.ANIME_EPISODES.replace(':slug', slug)),
  getEpisodeByNumber: (animeSlug: string, episodeNumber: number) => 
    fetchFromApi(ApiEndpoint.EPISODE_BY_NUMBER.replace(':slug', animeSlug).replace(':episode', episodeNumber.toString())),
  getEpisodeDetail: (slug: string) => fetchFromApi(ApiEndpoint.EPISODE_DETAIL.replace(':slug', slug)),
  getBatchByAnimeSlug: (slug: string) => fetchFromApi(ApiEndpoint.BATCH_BY_ANIME_SLUG.replace(':slug', slug)),
  getMovies: (page = 1) => fetchFromApi(ApiEndpoint.MOVIES.replace(':page?', page.toString())),
  getSingleMovie: (year: string, month: string, movieSlug: string) => 
    fetchFromApi(ApiEndpoint.SINGLE_MOVIE.replace(':year', year).replace(':month', month).replace(':slug', movieSlug)),
  getJadwalRilis: () => fetchFromApi(ApiEndpoint.JADWAL_RILIS),
  // Weather Services
  getWeather: (location: string, lang = 'en') => fetchFromApi(ApiEndpoint.WEATHER.replace(':location', location), { lang }),
  getWeatherAscii: (location: string, lang = 'en') => fetchFromApi(ApiEndpoint.WEATHER_ASCII.replace(':location', location), { lang }), 
  getWeatherQuick: (location: string, lang = 'en') => fetchFromApi(ApiEndpoint.WEATHER_QUICK.replace(':location', location), { lang }),
  getWeatherPng: (location: string) => fetchFromApi(ApiEndpoint.WEATHER_PNG.replace(':location', location)), // Image usually doesn't take lang param in this context
};

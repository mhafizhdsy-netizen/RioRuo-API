import { ApiEndpoint } from '../types';

// Determine Base URL based on environment
// Updated: Hardcoded to the live Vercel deployment as requested
export const BASE_URL = 'https://rioruo.vercel.app';

async function fetchFromApi<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  // Construct the full URL
  // If BASE_URL is absolute (e.g. https://rioruo.vercel.app), the second argument is ignored
  const url = new URL(`${BASE_URL}${endpoint}`, window.location.origin);
  
  if (params) {
    Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
    });
  }

  const res = await fetch(url.toString());
  
  if (!res.ok) {
      // Try to parse error message from JSON response
      let errorMessage = `HTTP Error: ${res.status} ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData.message) errorMessage = errorData.message;
      } catch (e) { 
        // ignore json parse error, stick to status text 
      }
      
      throw new Error(errorMessage);
  }
  
  return await res.json();
}

export const apiService = {
  getHome: () => fetchFromApi(ApiEndpoint.HOME),
  getRecent: (page = 1) => fetchFromApi(ApiEndpoint.RECENT, { page: page.toString() }),
  getSearch: (query: string, page = 1) => fetchFromApi(ApiEndpoint.SEARCH, { q: query, page: page.toString() }),
  getOngoing: (page = 1) => fetchFromApi(ApiEndpoint.ONGOING, { page: page.toString(), order: 'popular' }),
  getCompleted: (page = 1) => fetchFromApi(ApiEndpoint.COMPLETED, { page: page.toString(), order: 'latest' }),
  getPopular: (page = 1) => fetchFromApi(ApiEndpoint.POPULAR, { page: page.toString() }),
  getMovies: (page = 1) => fetchFromApi(ApiEndpoint.MOVIES, { page: page.toString() }),
  getSchedule: () => fetchFromApi(ApiEndpoint.SCHEDULE),
  getGenres: () => fetchFromApi(ApiEndpoint.GENRES),
  getGenreDetail: (id: string, page = 1) => fetchFromApi(ApiEndpoint.GENRE_DETAIL.replace(':genreId', id), { page: page.toString() }),
  getBatchList: (page = 1) => fetchFromApi(ApiEndpoint.BATCH_LIST, { page: page.toString() }),
  getBatchDetail: (id: string) => fetchFromApi(ApiEndpoint.BATCH_DETAIL.replace(':batchId', id)),
  getAnimeDetail: (id: string) => fetchFromApi(ApiEndpoint.ANIME_DETAIL.replace(':animeId', id)),
  getEpisodeDetail: (id: string) => fetchFromApi(ApiEndpoint.EPISODE_DETAIL.replace(':episodeId', id)),
  getServer: (id: string) => fetchFromApi(ApiEndpoint.SERVER.replace(':serverId', id)),
};
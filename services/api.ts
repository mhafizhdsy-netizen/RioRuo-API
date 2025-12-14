import { ApiEndpoint } from '../types';

// Determine Base URL based on environment
// In development, we target the local Express server on port 5000
// In production, we assume the API is served from the same origin (relative path)
export const BASE_URL = (import.meta as any).env?.DEV ? 'http://localhost:5000' : '';

async function fetchFromApi<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  // Construct the full URL
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
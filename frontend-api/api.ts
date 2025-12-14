import { ApiEndpoint } from '../src/types/types.js'; // Correct relative path from frontend-api/ to src/types/types.ts

// Determine Base URL based on environment
// Updated: Hardcoded to the live Vercel deployment as requested
export const BASE_URL = 'https://rioruo.vercel.app';

async function fetchFromApi<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  // Construct the full path including the backend's base API route prefix
  const fullApiPath = `/otakudesu/v1${endpoint}`;
  // If BASE_URL is absolute (e.g. https://rioruo.vercel.app), the second argument is ignored
  const url = new URL(`${BASE_URL}${fullApiPath}`, window.location.origin);
  
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
};
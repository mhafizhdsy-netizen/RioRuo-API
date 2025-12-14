export interface Pagination {
  currentPage: number;
  hasPrevPage: boolean;
  prevPage: number | null;
  hasNextPage: boolean;
  nextPage: number | null;
  totalPages: number;
}

export interface AnimeBase {
  title: string;
  poster: string;
  animeId: string;
  href: string;
  samehadakuUrl: string;
  score?: string;
  type?: string;
  status?: string;
  releasedOn?: string;
  episodes?: string | number;
  genres?: string; // Sometimes a string list in schedule
  estimation?: string; // For schedule
}

export interface Genre {
  title: string;
  genreId: string;
  href: string;
  samehadakuUrl: string;
}

export interface AnimeDetail extends Omit<AnimeBase, 'score'> {
  score?: { value: string; users: string };
  japanese?: string;
  synonyms?: string;
  english?: string;
  source?: string;
  duration?: string;
  season?: string;
  studios?: string;
  producers?: string;
  aired?: string;
  trailer?: string;
  synopsis?: {
    paragraphs: string[];
    connections: any[];
  };
  genreList?: Genre[];
  batchList?: any[];
  episodeList?: EpisodeLink[];
  recommendations?: AnimeBase[];
}

export interface EpisodeLink {
  title: string | number;
  episodeId: string;
  href: string;
  samehadakuUrl: string;
  releaseDate?: string;
}

export interface StreamQuality {
  title: string;
  urls: { title: string; url: string }[];
}

export interface StreamFormat {
  title: string;
  qualities: StreamQuality[];
}

export interface EpisodeDetail {
  title: string;
  animeId: string;
  poster: string;
  releasedOn: string;
  defaultStreamingUrl: string;
  hasPrevEpisode: boolean;
  prevEpisode: EpisodeLink | null;
  hasNextEpisode: boolean;
  nextEpisode: EpisodeLink | null;
  server: {
    qualities: {
      title: string;
      serverList: { title: string; serverId: string; href: string }[];
    }[];
  };
  downloadUrl: {
    formats: StreamFormat[];
  };
}

export interface ApiResponse<T> {
  status: string;
  creator: string;
  message: string;
  data: T;
  pagination?: Pagination | null;
}

// Specific Data Structures for Endpoints
export interface HomeData {
  recent: { href: string; animeList: AnimeBase[] };
  batch: { href: string; batchList: any[] };
  movie: { href: string; animeList: AnimeBase[] };
  top10: { href: string; animeList: (AnimeBase & { rank: number })[] };
}

export interface SearchData {
  animeList: AnimeBase[];
}

export interface ScheduleData {
  days: { day: string; animeList: AnimeBase[] }[];
}

export interface GenreListData {
  genreList: Genre[];
}

export interface BatchListData {
  batchList: AnimeBase[]; // Simplified
}

// API Endpoint Enum
export enum ApiEndpoint {
  HOME = '/anime/samehadaku/home',
  RECENT = '/anime/samehadaku/recent',
  SEARCH = '/anime/samehadaku/search',
  ONGOING = '/anime/samehadaku/ongoing',
  COMPLETED = '/anime/samehadaku/completed',
  POPULAR = '/anime/samehadaku/popular',
  MOVIES = '/anime/samehadaku/movies',
  SCHEDULE = '/anime/samehadaku/schedule',
  GENRES = '/anime/samehadaku/genres',
  GENRE_DETAIL = '/anime/samehadaku/genres/:genreId',
  BATCH_LIST = '/anime/samehadaku/batch',
  BATCH_DETAIL = '/anime/samehadaku/batch/:batchId',
  ANIME_DETAIL = '/anime/samehadaku/anime/:animeId',
  EPISODE_DETAIL = '/anime/samehadaku/episode/:episodeId',
  SERVER = '/anime/samehadaku/server/:serverId',
}
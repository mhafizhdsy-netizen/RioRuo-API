// Defined interfaces for the scrapers and API responses
export interface genre {
  name: string;
  slug: string;
  otakudesu_url?: string;
}

export interface episode_list {
  episode: string;
  slug: string;
  otakudesu_url?: string;
}

export interface batch {
  batch: string;
  download_urls: any[];
}

export interface anime {
  title: string;
  japanese_title?: string;
  poster?: string;
  rating?: string;
  produser?: string;
  type?: string;
  status?: string;
  episode_count?: string;
  duration?: string;
  release_date?: string;
  studio?: string;
  genres?: genre[];
  synopsis?: string;
  batch?: batch;
  episode_lists?: episode_list[];
  recommendations?: any[];
}

export interface searchResultAnime {
  title: string;
  slug: string;
  poster?: string;
  genres?: genre[];
  status?: string;
  rating?: string;
  url?: string;
}

export interface ongoingAnime {
  title: string;
  slug: string;
  poster?: string;
  current_episode?: string;
  release_day?: string;
  newest_release_date?: string;
  otakudesu_url?: string;
}

export interface completeAnime {
  title: string;
  slug: string;
  poster?: string;
  episode_count?: string;
  rating?: string;
  last_release_date?: string;
  otakudesu_url?: string;
}

export interface episode {
  episode: string;
  anime: {
    slug?: string;
    otakudesu_url?: string;
  };
  has_previous_episode: boolean;
  previous_episode_slug?: string | null;
  has_next_episode: boolean;
  next_episode_slug?: string | null;
  stream_url?: string | null;
  streamList?: any[];
  download_urls?: any[];
}

export interface movie {
  title: string;
  poster?: string;
  sinopsi?: string;
  download_urls?: any;
  stream_url?: any;
}

export interface movies {
  title: string;
  code?: string;
  slug: string;
  poster?: string;
  otakudesu_url?: string;
}

export interface jadwalRilisItem {
  title: string;
  slug: string;
  otakudesu_url: string;
}

export interface jadwalRilisDay {
  day: string;
  animeList: jadwalRilisItem[];
}

export interface quote {
  text: string;
  author: string;
  tags: string[];
  likes: number;
}

export enum ApiEndpoint {
  HOME = '/v1/home',
  SEARCH = '/v1/search/:keyword',
  ONGOING = '/v1/ongoing-anime/:page?',
  COMPLETED = '/v1/complete-anime/:page?',
  ANIME_DETAIL = '/v1/anime/:slug',
  ANIME_EPISODES = '/v1/anime/:slug/episodes',
  EPISODE_BY_NUMBER = '/v1/anime/:slug/episodes/:episode',
  EPISODE_DETAIL = '/v1/episode/:slug',
  GENRES = '/v1/genres',
  GENRE_DETAIL = '/v1/genres/:slug/:page?',
  BATCH_DETAIL = '/v1/batch/:slug',
  BATCH_BY_ANIME_SLUG = '/v1/anime/:slug/batch',
  MOVIES = '/v1/movies/:page?',
  SINGLE_MOVIE = '/v1/movies/:year/:month/:slug',
  JADWAL_RILIS = '/v1/jadwal-rilis',
  WEATHER = '/v1/weather/:location',
  WEATHER_ASCII = '/v1/weather/ascii/:location',
  WEATHER_QUICK = '/v1/weather/quick/:location',
  WEATHER_PNG = '/v1/weather/png/:location',
  QUOTES = '/v1/quotes/:page?',
  QUOTES_DEFAULT = '/v1/quotes', 
  QUOTES_BY_TAG = '/v1/quotes/tag/:tag/:page?',
  QUOTES_BY_TAG_DEFAULT = '/v1/quotes/tag/:tag', 
  SHORT_VGD = '/v1/vgd',
  SHORT_VGD_CUSTOM = '/v1/vgd/custom',
  YTDL_INFO = '/v1/ytdl/info',
  YTDL_DOWNLOAD = '/v1/ytdl/download',
  KOMIKU_PAGE = '/v1/manga/page/:page?',
  KOMIKU_POPULAR = '/v1/manga/popular/:page?',
  KOMIKU_DETAIL = '/v1/manga/detail/:endpoint',
  KOMIKU_SEARCH = '/v1/manga/search/:query',
  KOMIKU_GENRES = '/v1/manga/genre',
  KOMIKU_GENRE_DETAIL = '/v1/manga/genre/:endpoint', 
  KOMIKU_RECOMMENDED = '/v1/manga/recommended',
  KOMIKU_MANHUA = '/v1/manhua/:page?',
  KOMIKU_MANHWA = '/v1/manhwa/:page?',
  KOMIKU_CHAPTER = '/v1/chapter/:title',
  SAMEHADAKU_HOME = '/v1/samehadaku/home/:page?',
  SAMEHADAKU_SESION = '/v1/samehadaku/sesion/:page/:orderby',
  SAMEHADAKU_ANIME = '/v1/samehadaku/anime/:slug',
  SAMEHADAKU_STREAM = '/v1/samehadaku/stream/:slug',
  SAMEHADAKU_SEARCH = '/v1/samehadaku/search',
  TIKTOK_STALK = '/v1/tiktok/stalk',
  TIKTOK_DOWNLOAD = '/v1/tiktok/download',
}
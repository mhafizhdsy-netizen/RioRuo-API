
type anime = {
  title: string | undefined;
  japanese_title: string | undefined;
  poster: string | undefined;
  rating: string | undefined;
  produser: string | undefined;
  type: string | undefined;
  status: string | undefined;
  episode_count: string | undefined;
  duration: string | undefined;
  release_date: string | undefined;
  studio: string | undefined;
  genres: genre[];
  synopsis: string | undefined;
  batch: {
    slug: string | undefined;
    otakudesu_url: string | undefined;
    uploaded_at: string | undefined;
  } | null;
  episode_lists: episode_list[];
  recommendations: {
    title: string | undefined;
    slug: string | undefined;
    poster: string | undefined;
    otakudesu_url: string | undefined;
  }[];
};

type searchResultAnime = {
  title: string | undefined;
  slug: string | undefined;
  poster: string | undefined;
  status: string | undefined;
  rating: string | undefined;
  genres: genre[];
  url: string | undefined;
};

type ongoingAnime = {
  title: string | undefined;
  slug: string | undefined;
  poster: string | undefined;
  current_episode: string | undefined;
  release_day: string | undefined;
  newest_release_date: string | undefined;
  otakudesu_url: string | undefined;
};

type completeAnime = {
  title: string | undefined;
  slug: string | undefined;
  poster: string | undefined;
  episode_count: string | undefined;
  rating: string | undefined;
  last_release_date: string | undefined;
  otakudesu_url: string | undefined;
};

type genre = {
  name: string | undefined;
  slug: string | undefined;
  otakudesu_url: string | undefined;
};

type episode_list = {
  episode: string | undefined;
  slug: string | undefined;
  otakudesu_url: string | undefined
};

type episode = {
  episode: string;
  anime: {
    slug: string | undefined;
    otakudesu_url: string | undefined;
  };
  has_previous_episode: boolean;
  previous_episode_slug: string | null;
  next_episode_slug: string | null;
  has_next_episode: boolean;
  stream_url: string | undefined;
  streamList: {quality: string, provider: string, url: string | null}[];
  download_urls: {
    format_title: string,
    formats: {
      resolution: string,
      size: string,
      links: {
        provider: string,
        url: string | undefined
      }[]
    }[]
  }[];
};

type batch = {
  batch: string | undefined;
  download_urls: {
    resolution: string | undefined;
    file_size: string | undefined;
    urls: {
      provider: string | undefined;
      url: string | undefined;
    }[];
  }[];
}

type movie = {
  title: string | undefined;
  poster: string | undefined;
  sinopsi: string | undefined;
  download_urls: any; 
  stream_url: any; 
};

type movies = {
  movies: {
    title: string | undefined;
    code: string | undefined;
    slug: string | undefined;
    poster: string | undefined;
    otakudesu_url: string | undefined;
  }[];
  pagination: {
    current_page: number;
    last_visible_page: number;
    has_next_page: boolean;
    next_page: number | null;
    has_previous_page: boolean;
    previous_page: number | null;
  };
};

type jadwalRilisItem = {
    title: string;
    slug: string;
    otakudesu_url: string;
};

type jadwalRilisDay = {
    day: string;
    animeList: jadwalRilisItem[];
};

type quote = {
    text: string;
    author: string;
    tags: string[];
    likes: number;
};

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
  // Weather Endpoints
  WEATHER = '/v1/weather/:location',
  WEATHER_ASCII = '/v1/weather/ascii/:location',
  WEATHER_QUICK = '/v1/weather/quick/:location',
  WEATHER_PNG = '/v1/weather/png/:location',
  // Quote Endpoints
  QUOTES = '/v1/quotes/:page?',
  QUOTES_DEFAULT = '/v1/quotes', // No pagination param
  QUOTES_BY_TAG = '/v1/quotes/tag/:tag/:page?',
  QUOTES_BY_TAG_DEFAULT = '/v1/quotes/tag/:tag', // No pagination param
  // VGD Shortener Endpoints
  SHORT_VGD = '/v1/vgd',
  SHORT_VGD_CUSTOM = '/v1/vgd/custom',
  // Komiku Endpoints
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
  // Animasu Endpoints
  ANIMASU_ONGOING = '/v1/animasu/ongoing/:page?',
  ANIMASU_DETAIL = '/v1/animasu/detail/:slug',
  ANIMASU_EPISODE = '/v1/animasu/episode/:slug',
  ANIMASU_SEARCH = '/v1/animasu/search/:page?', // Query param s=
  ANIMASU_GENRE = '/v1/animasu/genre/:slug/:page?',
  ANIMASU_MOVIES = '/v1/animasu/movies/:page?',
}

export {
  anime,
  searchResultAnime,
  ongoingAnime,
  completeAnime,
  genre,
  episode_list,
  episode,
  batch,
  movie,
  movies,
  jadwalRilisDay,
  jadwalRilisItem,
  quote
};

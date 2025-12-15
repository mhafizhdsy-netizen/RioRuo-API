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


export enum ApiEndpoint {
  HOME = '/home',
  SEARCH = '/search/:keyword',
  ONGOING = '/ongoing-anime/:page?',
  COMPLETED = '/complete-anime/:page?',
  ANIME_DETAIL = '/anime/:slug',
  ANIME_EPISODES = '/anime/:slug/episodes',
  EPISODE_BY_NUMBER = '/anime/:slug/episodes/:episode',
  EPISODE_DETAIL = '/episode/:slug',
  GENRES = '/genres',
  GENRE_DETAIL = '/genres/:slug/:page?',
  BATCH_DETAIL = '/batch/:slug',
  BATCH_BY_ANIME_SLUG = '/anime/:slug/batch',
  MOVIES = '/movies/:page?', // New Endpoint
  SINGLE_MOVIE = '/movies/:year/:month/:slug', // Updated Endpoint
  JADWAL_RILIS = '/jadwal-rilis', // New Endpoint
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
  movie, // Export new type
  movies, // Export new type
  jadwalRilisDay, // Export new type
  jadwalRilisItem // Export new type
};
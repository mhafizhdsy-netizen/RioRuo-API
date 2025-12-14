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
  has_next_episode: boolean;
  next_episode: {
    slug: string | undefined;
    otakudesu_url: string | undefined;
  } | null;
  has_previous_episode: boolean;
  previous_episode: {
    slug: string | undefined;
    otakudesu_url: string | undefined;
  } | null;
  stream_url: string | undefined;
  download_urls: {
    mp4: {
      resolution: string | undefined;
      urls: {
        provider: string | undefined;
        url: string | undefined;
      }[];
    }[];
    mkv: {
      resolution: string | undefined;
      urls: {
        provider: string | undefined;
        url: string | undefined;
      }[];
    }[];
  };
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
}

interface ApiResponse<T> {
  status: string;
  creator: string;
  message: string;
  data: T;
  pagination: {
    currentPage: number;
    hasPrevPage: boolean;
    prevPage: number | null;
    hasNextPage: boolean;
    nextPage: number | null;
    totalPages: number;
  } | null;
}

interface HomeData {
  recent: {
    href: string;
    animeList: {
      title: string;
      poster: string;
      episodes?: string;
      releasedOn: string;
      slug: string;
      href: string;
      otakudesuUrl: string;
    }[];
  };
  batch: {
    href: string;
    batchList: {
      title?: string;
      poster?: string;
      releasedOn?: string;
      slug?: string;
      href?: string;
      otakudesuUrl?: string;
    }[];
  };
  movie: {
    href: string;
    animeList: {
      title: string;
      poster: string;
      releasedOn: string;
      slug: string;
      href: string;
      otakudesuUrl: string;
    }[];
  };
  top10: {
    href: string;
    animeList: {
      rank: number;
      title: string;
      poster: string;
      score: string;
      slug: string;
      href: string;
      otakudesuUrl: string;
    }[];
  };
}

interface SearchData {
  animeList: {
    title: string;
    poster: string;
    type: string;
    score: string;
    status: string;
    slug: string;
    href: string;
    otakudesuUrl: string;
  }[];
}

interface ScheduleData {
  days: {
    day: string;
    animeList: {
      title: string;
      poster: string;
      type: string;
      score: string;
      estimation: string;
      genres: string;
      slug: string;
      href: string;
      otakudesuUrl: string;
    }[];
  }[];
}

interface GenreListData {
  genreList: {
    title: string;
    slug: string;
    href: string;
    otakudesuUrl: string;
  }[];
}

interface AnimeDetail {
  title: string;
  poster: string;
  score: {
    value: string;
    users: string;
  };
  japanese: string;
  synonyms: string;
  english: string;
  status: string;
  type: string;
  source: string;
  duration: string;
  episodes: string | null;
  season: string;
  studios: string;
  producers: string;
  aired: string;
  trailer: string;
  slug: string;
  href: string;
  otakudesuUrl: string;
  synopsis: {
    paragraphs: string[];
    connections: any[];
  };
  genreList: {
    title: string;
    slug: string;
    href: string;
    otakudesuUrl: string;
  }[];
  batchList: {
    title: string;
    slug: string;
    href: string;
    otakudesuUrl: string;
  }[];
  episodeList: {
    title: number;
    slug: string;
    href: string;
    otakudesuUrl: string;
  }[];
}

interface EpisodeDetail {
  title: string;
  animeSlug: string;
  poster: string;
  releasedOn: string;
  defaultStreamingUrl: string;
  hasPrevEpisode: boolean;
  prevEpisode: {
    title: string;
    slug: string;
    href: string;
    otakudesuUrl: string;
  } | null;
  hasNextEpisode: boolean;
  nextEpisode: {
    title: string;
    slug: string;
    href: string;
    otakudesuUrl: string;
  } | null;
  server: {
    qualities: {
      title: string;
      serverList: {
        title: string;
        serverId: string;
        href: string;
      }[];
    }[];
  };
  downloadUrl: {
    formats: {
      title: string;
      qualities: {
        title: string;
        urls: {
          title: string;
          url: string;
        }[];
      }[];
    }[];
  };
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
  ApiResponse,
  HomeData,
  SearchData,
  ScheduleData,
  GenreListData,
  AnimeDetail,
  EpisodeDetail,
};
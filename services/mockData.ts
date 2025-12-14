import { ApiResponse, HomeData, SearchData, ScheduleData, GenreListData, AnimeDetail, EpisodeDetail } from '../types';

// 1. Home Data
export const mockHomeData: ApiResponse<HomeData> = {
  "status": "success",
  "creator": "Sanka Vollerei",
  "message": "",
  "data": {
    "recent": {
      "href": "/samehadaku/recent",
      "animeList": [
        {
          "title": "Shuumatsu no Valkyrie Season 3",
          "poster": "https://v1.samehadaku.how/wp-content/uploads/2025/12/Shuumatsu-no-Valkyrie-Season-3-Episode-15-END.jpg",
          "episodes": "15",
          "releasedOn": "11 hours yang lalu",
          "animeId": "shuumatsu-no-valkyrie-season-3",
          "href": "/samehadaku/anime/shuumatsu-no-valkyrie-season-3",
          "samehadakuUrl": "https://v1.samehadaku.how/anime/shuumatsu-no-valkyrie-season-3/"
        },
        {
          "title": "Akujiki Reijou to Kyouketsu Koushaku",
          "poster": "https://v1.samehadaku.how/wp-content/uploads/2025/12/Akujiki-Reijou-to-Kyouketsu-Koushaku-Episode-11.jpg",
          "episodes": "11",
          "releasedOn": "14 hours yang lalu",
          "animeId": "akujiki-reijou-to-kyouketsu-koushaku",
          "href": "/samehadaku/anime/akujiki-reijou-to-kyouketsu-koushaku",
          "samehadakuUrl": "https://v1.samehadaku.how/anime/akujiki-reijou-to-kyouketsu-koushaku/"
        },
        {
          "title": "One Punch Man Season 3",
          "poster": "https://v1.samehadaku.how/wp-content/uploads/2025/12/One-Punch-Man-S3-09.jpg",
          "episodes": "9",
          "releasedOn": "5 days yang lalu",
          "animeId": "one-punch-man-season-3",
          "href": "/samehadaku/anime/one-punch-man-season-3",
          "samehadakuUrl": "https://v1.samehadaku.how/anime/one-punch-man-season-3/"
        }
      ]
    },
    "batch": {
      "href": "/samehadaku/batch",
      "batchList": []
    },
    "movie": {
      "href": "/samehadaku/movies",
      "animeList": [
        {
          "title": "Chainsaw Man Reze-hen",
          "poster": "https://v1.samehadaku.how/wp-content/uploads/2025/12/bx171627-ZN9D7P46yHnw.png",
          "releasedOn": "Sep 19, 2025",
          "animeId": "chainsaw-man-reze-hen-index",
          "href": "/samehadaku/anime/chainsaw-man-reze-hen-index",
          "samehadakuUrl": "https://v1.samehadaku.how/anime/chainsaw-man-reze-hen-index/"
        }
      ]
    },
    "top10": {
      "href": "/samehadaku/top10",
      "animeList": [
        {
          "rank": 1,
          "title": "One Piece",
          "poster": "https://v1.samehadaku.how/wp-content/uploads/2020/04/E5RxYkWX0AAwdGH.png.jpg",
          "score": "8.73",
          "animeId": "one-piece",
          "href": "/samehadaku/anime/one-piece",
          "samehadakuUrl": "https://v1.samehadaku.how/anime/one-piece/"
        },
        {
          "rank": 2,
          "title": "One Punch Man Season 3",
          "poster": "https://v1.samehadaku.how/wp-content/uploads/2025/10/148347.jpg",
          "score": "4.59",
          "animeId": "one-punch-man-season-3",
          "href": "/samehadaku/anime/one-punch-man-season-3",
          "samehadakuUrl": "https://v1.samehadaku.how/anime/one-punch-man-season-3/"
        }
      ]
    }
  },
  "pagination": null
};

// 2. Recent (Pagination)
export const mockRecentData: ApiResponse<any> = {
  "status": "success",
  "creator": "Sanka Vollerei",
  "message": "",
  "data": {
    "animeList": [
      {
        "title": "Shuumatsu no Valkyrie Season 3",
        "poster": "https://v1.samehadaku.how/wp-content/uploads/2025/12/Shuumatsu-no-Valkyrie-Season-3-Episode-15-END.jpg",
        "episodes": "15",
        "releasedOn": "11 hours yang lalu",
        "animeId": "shuumatsu-no-valkyrie-season-3",
        "href": "/samehadaku/anime/shuumatsu-no-valkyrie-season-3",
        "samehadakuUrl": "https://v1.samehadaku.how/anime/shuumatsu-no-valkyrie-season-3/"
      }
    ]
  },
  "pagination": {
    "currentPage": 1,
    "hasPrevPage": false,
    "prevPage": null,
    "hasNextPage": true,
    "nextPage": 2,
    "totalPages": 690
  }
};

// 3. Search Data
export const mockSearchData: ApiResponse<SearchData> = {
  "status": "success",
  "creator": "Sanka Vollerei",
  "message": "",
  "data": {
    "animeList": [
      {
        "title": "One Piece: Gyojin Tou-hen",
        "poster": "https://v1.samehadaku.how/wp-content/uploads/2024/11/One-Piece-Gyojin-Tou-hen.jpg",
        "type": "TV",
        "score": "",
        "status": "Completed",
        "animeId": "one-piece-gyojin-tou-hen",
        "href": "/samehadaku/anime/one-piece-gyojin-tou-hen",
        "samehadakuUrl": "https://v1.samehadaku.how/anime/one-piece-gyojin-tou-hen/"
      },
      {
        "title": "One Piece Fan Letter",
        "poster": "https://v1.samehadaku.how/wp-content/uploads/2024/10/One-Piece-Fan-Letter.jpg",
        "type": "TV",
        "score": "8.86",
        "status": "Completed",
        "animeId": "one-piece-fan-letter",
        "href": "/samehadaku/anime/one-piece-fan-letter",
        "samehadakuUrl": "https://v1.samehadaku.how/anime/one-piece-fan-letter/"
      }
    ]
  },
  "pagination": {
    "currentPage": 1,
    "hasPrevPage": false,
    "prevPage": null,
    "hasNextPage": false,
    "nextPage": null,
    "totalPages": 1
  }
};

// 4. Ongoing
export const mockOngoingData: ApiResponse<any> = {
  "status": "success",
  "creator": "Sanka Vollerei",
  "message": "",
  "data": {
    "animeList": [
      {
        "title": "Akujiki Reijou to Kyouketsu Koushaku",
        "poster": "https://v1.samehadaku.how/wp-content/uploads/2025/10/Akujiki-Reijou-to-Kyouketsu-Koushaku.jpg",
        "type": "TV",
        "score": "7.15",
        "status": "Ongoing",
        "animeId": "akujiki-reijou-to-kyouketsu-koushaku",
        "href": "/samehadaku/anime/akujiki-reijou-to-kyouketsu-koushaku",
        "samehadakuUrl": "https://v1.samehadaku.how/anime/akujiki-reijou-to-kyouketsu-koushaku/"
      }
    ]
  },
  "pagination": {
    "currentPage": 1,
    "hasPrevPage": false,
    "prevPage": null,
    "hasNextPage": true,
    "nextPage": 2,
    "totalPages": 2
  }
};

// 5. Completed
export const mockCompletedData: ApiResponse<any> = {
  "status": "success",
  "creator": "Sanka Vollerei",
  "message": "",
  "data": {
    "animeList": [
      {
        "title": "#Compass2.0 Animation Project",
        "poster": "https://v1.samehadaku.how/wp-content/uploads/2025/04/Compass2.0-Animation-Project.jpg",
        "type": "TV",
        "score": "6.01",
        "status": "Completed",
        "animeId": "compass2-0-animation-project",
        "href": "/samehadaku/anime/compass2-0-animation-project",
        "samehadakuUrl": "https://v1.samehadaku.how/anime/compass2-0-animation-project/"
      }
    ]
  },
  "pagination": {
    "currentPage": 1,
    "hasPrevPage": false,
    "prevPage": null,
    "hasNextPage": true,
    "nextPage": 2,
    "totalPages": 21
  }
};

// 6. Popular
export const mockPopularData: ApiResponse<any> = {
  "status": "success",
  "creator": "Sanka Vollerei",
  "message": "",
  "data": {
    "animeList": [
      {
        "title": "One Piece",
        "poster": "https://v1.samehadaku.how/wp-content/uploads/2020/04/E5RxYkWX0AAwdGH.png.jpg",
        "type": "TV",
        "score": "8.73",
        "status": "Ongoing",
        "animeId": "one-piece",
        "href": "/samehadaku/anime/one-piece",
        "samehadakuUrl": "https://v1.samehadaku.how/anime/one-piece/"
      }
    ]
  },
  "pagination": {
    "currentPage": 1,
    "hasPrevPage": false,
    "prevPage": null,
    "hasNextPage": true,
    "nextPage": 2,
    "totalPages": 22
  }
};

// 7. Movies
export const mockMoviesData: ApiResponse<any> = {
  "status": "success",
  "creator": "Sanka Vollerei",
  "message": "",
  "data": {
    "animeList": [
      {
        "title": "Chainsaw Man Reze-hen",
        "poster": "https://v1.samehadaku.how/wp-content/uploads/2025/12/bx171627-ZN9D7P46yHnw.png",
        "type": "Movie",
        "score": "9.18",
        "status": "Completed",
        "animeId": "chainsaw-man-reze-hen-index",
        "href": "/samehadaku/anime/chainsaw-man-reze-hen-index",
        "samehadakuUrl": "https://v1.samehadaku.how/anime/chainsaw-man-reze-hen-index/"
      }
    ]
  },
  "pagination": {
    "currentPage": 1,
    "hasPrevPage": false,
    "prevPage": null,
    "hasNextPage": true,
    "nextPage": 2,
    "totalPages": 2
  }
};

// 8. Schedule
export const mockScheduleData: ApiResponse<ScheduleData> = {
  "status": "success",
  "creator": "Sanka Vollerei",
  "message": "",
  "data": {
    "days": [
      {
        "day": "Friday",
        "animeList": [
          {
            "title": "Akujiki Reijou to Kyouketsu Koushaku",
            "poster": "https://v1.samehadaku.how/wp-content/uploads/2025/10/Akujiki-Reijou-to-Kyouketsu-Koushaku.jpg",
            "type": "TV",
            "score": "7.15",
            "estimation": "Update",
            "genres": "Fantasy, Gourmet",
            "animeId": "akujiki-reijou-to-kyouketsu-koushaku",
            "href": "/samehadaku/anime/akujiki-reijou-to-kyouketsu-koushaku",
            "samehadakuUrl": "https://v1.samehadaku.how/anime/akujiki-reijou-to-kyouketsu-koushaku/"
          }
        ]
      }
    ]
  },
  "pagination": null
};

// 9. Genres List
export const mockGenresData: ApiResponse<GenreListData> = {
  "status": "success",
  "creator": "Sanka Vollerei",
  "message": "",
  "data": {
    "genreList": [
      {
        "title": "Fantasy",
        "genreId": "fantasy",
        "href": "/samehadaku/genres/fantasy",
        "samehadakuUrl": "https://v1.samehadaku.how/genre/fantasy"
      },
      {
        "title": "Action",
        "genreId": "action",
        "href": "/samehadaku/genres/action",
        "samehadakuUrl": "https://v1.samehadaku.how/genre/action"
      }
    ]
  },
  "pagination": null
};

// 10. Anime By Genre
export const mockAnimeByGenreData: ApiResponse<any> = {
  "status": "success",
  "creator": "Sanka Vollerei",
  "message": "",
  "data": {
    "animeList": [
      {
        "title": "Shuumatsu no Valkyrie Season 3",
        "poster": "https://v1.samehadaku.how/wp-content/uploads/2025/12/Shuumatsu-no-Valkyrie-Season-3.jpg",
        "type": "ONA",
        "score": "7.65",
        "status": "Completed",
        "animeId": "shuumatsu-no-valkyrie-season-3",
        "href": "/samehadaku/anime/shuumatsu-no-valkyrie-season-3",
        "samehadakuUrl": "https://v1.samehadaku.how/anime/shuumatsu-no-valkyrie-season-3/"
      }
    ]
  },
  "pagination": {
    "currentPage": 1,
    "hasPrevPage": false,
    "prevPage": null,
    "hasNextPage": true,
    "nextPage": 2,
    "totalPages": 24
  }
};

// 11. Batch List
export const mockBatchListData: ApiResponse<any> = {
  "status": "success",
  "creator": "Sanka Vollerei",
  "message": "",
  "data": {
    "batchList": [
      {
        "title": "Mushoku no Eiyuu Episode 1-12",
        "poster": "https://v1.samehadaku.how/wp-content/uploads/2025/09/151097.jpg",
        "type": "TV",
        "score": "6.55",
        "status": "Completed",
        "batchId": "mushoku-no-eiyuu",
        "href": "/samehadaku/batch/mushoku-no-eiyuu",
        "samehadakuUrl": "https://v1.samehadaku.how/batch/mushoku-no-eiyuu/"
      },
      {
        "title": "Witch Watch Episode 1-25 [BATCH]",
        "poster": "https://v1.samehadaku.how/wp-content/uploads/2025/04/148017.jpg",
        "type": "TV",
        "score": "7.4",
        "status": "Completed",
        "batchId": "witch-watch-episode-1-25-batch",
        "href": "/samehadaku/batch/witch-watch-episode-1-25-batch",
        "samehadakuUrl": "https://v1.samehadaku.how/batch/witch-watch-episode-1-25-batch/"
      }
    ]
  },
  "pagination": {
    "currentPage": 1,
    "hasPrevPage": false,
    "prevPage": null,
    "hasNextPage": true,
    "nextPage": 2,
    "totalPages": 16
  }
};

// 12. Batch Detail
export const mockBatchDetailData: ApiResponse<any> = {
  "status": "success",
  "creator": "Sanka Vollerei",
  "message": "",
  "data": {
    "title": "Kusuriya no Hitorigoto Season 2 Episode 1-24 [BATCH] Subtitle Indonesia",
    "animeId": "kusuriya-no-hitorigoto-season-2",
    "poster": "https://v1.samehadaku.how/wp-content/uploads/2025/01/146200.jpg",
    "japanese": "薬屋のひとりごと 第2期",
    "status": "Completed",
    "type": "TV",
    "source": "Light novel",
    "score": "8.9",
    "duration": "24 min. per ep.",
    "synopsis": {
        "paragraphs": [
            "Musim ke 2 dari Anime Kusuriya no Hitorigoto",
            "Tonton Season Sebelumnya"
        ]
    },
    "genreList": [
       { "title": "Dentsu", "genreId": "dentsu", "href": "/samehadaku/genres/dentsu", "samehadakuUrl": "https://v1.samehadaku.how/producers/dentsu/" }
    ],
    "downloadUrl": {
      "formats": [
        {
          "title": "MKV",
          "qualities": [
            {
              "title": "360p ",
              "urls": [
                {
                  "title": "Gofile",
                  "url": "https://gofile.io/d/HEEb7v"
                }
              ]
            }
          ]
        }
      ]
    }
  },
  "pagination": null
};

// 13. Anime Detail
export const mockAnimeDetailData: ApiResponse<AnimeDetail> = {
  "status": "success",
  "creator": "Sanka Vollerei",
  "message": "",
  "data": {
    "title": "One Piece",
    "poster": "https://v1.samehadaku.how/wp-content/uploads/2020/04/E5RxYkWX0AAwdGH.png.jpg",
    "score": {
      "value": "8.73",
      "users": "1,449,346"
    },
    "japanese": "ONE PIECE",
    "synonyms": "OP",
    "english": "One Piece",
    "status": "Ongoing",
    "type": "TV",
    "source": "Manga",
    "duration": "24 min.",
    "episodes": null,
    "season": "Fall 1999",
    "studios": "Toei Animation",
    "producers": "Fuji TV, Shueisha, TAP",
    "aired": "Oct 20, 1999 to ?",
    "trailer": "",
    "animeId": "one-piece",
    "href": "/samehadaku/anime/one-piece",
    "samehadakuUrl": "https://v1.samehadaku.how/anime/one-piece/",
    "synopsis": {
      "paragraphs": [
        "Gol D. Roger dikenal sebagai Raja Bajak Laut, Orang terkuat dan paling terkenal yang pernah mengarungi Grand Line..."
      ],
      "connections": []
    },
    "genreList": [
      {
        "title": "Action",
        "genreId": "action",
        "href": "/samehadaku/genres/action",
        "samehadakuUrl": "https://v1.samehadaku.how/genre/action"
      },
      {
        "title": "Adventure",
        "genreId": "adventure",
        "href": "/samehadaku/genres/adventure",
        "samehadakuUrl": "https://v1.samehadaku.how/genre/adventure"
      }
    ],
    "batchList": [
      {
         "title": "Download Batch Anime One Piece",
         "batchId": "one-piece-batch",
         "href": "/samehadaku/batch/one-piece-batch",
         "samehadakuUrl": "https://v1.samehadaku.how/batch/one-piece-batch/"
      }
    ],
    "episodeList": [
      {
        "title": 1152,
        "episodeId": "one-piece-episode-1152",
        "href": "/samehadaku/episode/one-piece-episode-1152",
        "samehadakuUrl": "https://v1.samehadaku.how/one-piece-episode-1152/"
      }
    ]
  },
  "pagination": null
};

// 14. Episode Detail
export const mockEpisodeDetailData: ApiResponse<EpisodeDetail> = {
  "status": "success",
  "creator": "Sanka Vollerei",
  "message": "",
  "data": {
    "title": "One Piece Episode 1141 Sub Indo",
    "animeId": "one-piece",
    "poster": "https://v1.samehadaku.how/wp-content/uploads/2020/04/E5RxYkWX0AAwdGH.png.jpg",
    "releasedOn": "4 months yang lalu",
    "defaultStreamingUrl": "https://www.blogger.com/video.g?token=AD6v5dxLuUbFbjiYZrIYOKrhQ852Bg_a7vqCrx2VqbFk_iONBTVY7-bwsnSwddYMKVB3of1wNeqbsAFAp54FwTvldsEInENMoFhVHUoi6mfetLQhyW_A7kv7ImOHXTEaF1YCxSrX8n4",
    "hasPrevEpisode": true,
    "prevEpisode": {
      "title": "Prev",
      "episodeId": "one-piece-episode-1140",
      "href": "/samehadaku/episode/one-piece-episode-1140",
      "samehadakuUrl": "https://v1.samehadaku.how/one-piece-episode-1140/"
    },
    "hasNextEpisode": true,
    "nextEpisode": {
      "title": "Next",
      "episodeId": "one-piece-episode-1142",
      "href": "/samehadaku/episode/one-piece-episode-1142",
      "samehadakuUrl": "https://v1.samehadaku.how/one-piece-episode-1142/"
    },
    "server": {
      "qualities": [
        {
          "title": "360p",
          "serverList": [
            {
              "title": "Blogspot 360p",
              "serverId": "9AAB5-6-xhmyrq",
              "href": "/samehadaku/server/9AAB5-6-xhmyrq"
            }
          ]
        },
        {
          "title": "1080p",
          "serverList": [
            {
              "title": "Mega 1080p",
              "serverId": "9AAB5-C-xhmyrq",
              "href": "/samehadaku/server/9AAB5-C-xhmyrq"
            }
          ]
        }
      ]
    },
    "downloadUrl": {
      "formats": [
        {
          "title": "MKV",
          "qualities": [
            {
              "title": "1080p ",
              "urls": [
                {
                  "title": "Gofile",
                  "url": "https://gofile.io/d/z8evGL"
                }
              ]
            }
          ]
        }
      ]
    }
  },
  "pagination": null
};

// 15. Server Data
export const mockServerData: ApiResponse<any> = {
  "status": "success",
  "creator": "Sanka Vollerei",
  "message": "",
  "data": {
    "url": "https://filedon.co/embed/rPIC8JNlBz"
  },
  "pagination": null
};
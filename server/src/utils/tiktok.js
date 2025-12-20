import Tiktok from '@tobyg74/tiktok-api-dl';

const calculateEngagementRate = (likes, videos, followers) => {
  if (videos === 0 || followers === 0) return '0%';
  const avgLikesPerVideo = likes / videos;
  const rate = (avgLikesPerVideo / followers) * 100;
  return `${rate.toFixed(2)}%`;
};

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num ? num.toString() : '0';
};

const transformUserInfo = (rawData) => {
  const users = rawData.result.users;
  const stats = rawData.result.stats;
  
  return {
    profile: {
      id: users.id,
      username: users.username,
      display_name: users.nickname,
      bio: users.signature,
      is_verified: users.verified,
      profile_picture: users.avatarLarger,
      region: users.region,
      profile_url: `https://www.tiktok.com/@${users.username}`
    },
    stats: {
      total_followers: stats.followerCount,
      total_following: stats.followingCount,
      total_likes: stats.heartCount,
      total_videos: stats.videoCount,
      engagement_rate: calculateEngagementRate(
        stats.heartCount, 
        stats.videoCount,
        stats.followerCount
      )
    }
  };
};

const transformVideoInfo = (rawData, version = 'v1') => {
  const result = rawData.result;
  
  if (version === 'v1') {
    return {
      video_info: {
        id: result.id,
        title: result.desc || 'No title',
        type: result.type,
        duration: result.video?.duration || null,
        created_at: result.createTime
      },
      author: {
        uid: result.author.uid,
        username: result.author.username,
        nickname: result.author.nickname,
        avatar: result.author.avatarThumb?.[0] || result.author.avatarThumb,
        signature: result.author.signature,
        region: result.author.region
      },
      engagement: {
        views: formatNumber(result.statistics.playCount),
        likes: formatNumber(result.statistics.likeCount),
        comments: formatNumber(result.statistics.commentCount),
        shares: formatNumber(result.statistics.shareCount),
        saves: formatNumber(result.statistics.collectCount)
      },
      media: {
        type: result.type,
        video_urls: result.video ? {
          play: result.video.playAddr,
          download: result.video.downloadAddr,
          cover: result.video.cover,
          dynamic_cover: result.video.dynamicCover
        } : null,
        images: result.images || null
      },
      music: {
        id: result.music.id,
        title: result.music.title,
        author: result.music.author,
        url: result.music.playUrl?.[0] || result.music.playUrl,
        duration: result.music.duration,
        cover: result.music.coverThumb?.[0] || result.music.coverThumb
      }
    };
  } else {
    return {
      video_info: {
        type: result.type,
        title: result.desc || 'No title'
      },
      media: {
        type: result.type,
        video_url: result.video?.playAddr || result.direct || result.videoHD,
        images: result.images || null
      }
    };
  }
};

export const stalkUser = async (username) => {
  const result = await Tiktok.StalkUser(username);
  if (result.status === 'success') {
    return transformUserInfo(result);
  }
  throw new Error(result.message || `User @${username} not found`);
};

export const downloadVideo = async (url, version = 'v1') => {
  const result = await Tiktok.Downloader(url, { version });
  if (result.status === 'success') {
    return transformVideoInfo(result, version);
  }
  throw new Error(result.message || 'Failed to retrieve video information');
};

export default { stalkUser, downloadVideo };
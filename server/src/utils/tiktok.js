import Tiktok from '@tobyg74/tiktok-api-dl';

const calculateEngagementRate = (likes, videos, followers) => {
  if (!videos || !followers || videos === 0 || followers === 0) return '0%';
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
  const result = rawData?.result;
  if (!result) throw new Error('Empty result from TikTok API');

  // Berdasarkan dokumentasi: result.user (singular)
  const user = result.user;
  const stats = result.stats;
  
  if (!user) {
    throw new Error('Could not extract user profile details. TikTok might be blocking the request or account is private.');
  }

  return {
    profile: {
      // Documentation shows 'username' instead of 'id'
      username: user.username || null,
      display_name: user.nickname || null,
      bio: user.signature || '',
      is_verified: !!user.verified,
      profile_picture: user.avatar || null,
      region: user.region || null,
      profile_url: user.username ? `https://www.tiktok.com/@${user.username}` : null
    },
    stats: stats ? {
      total_followers: stats.followerCount || 0,
      total_following: stats.followingCount || 0,
      total_likes: stats.heartCount || 0,
      total_videos: stats.videoCount || 0,
      engagement_rate: calculateEngagementRate(
        stats.heartCount || 0, 
        stats.videoCount || 0,
        stats.followerCount || 0
      )
    } : null
  };
};

const transformVideoInfo = (rawData, version = 'v1') => {
  const result = rawData?.result;
  if (!result) throw new Error('Failed to retrieve video information');
  
  // Mapping based on Version 1/2/3 in documentation
  if (version === 'v1' && result.author) {
    return {
      video_info: {
        id: result.id,
        title: result.desc || 'No title',
        type: result.type,
        duration: result.video?.duration || null,
        created_at: result.createTime
      },
      author: {
        username: result.author.username,
        nickname: result.author.nickname,
        avatar: Array.isArray(result.author.avatarThumb) ? result.author.avatarThumb[0] : result.author.avatarThumb,
        signature: result.author.signature,
        region: result.author.region
      },
      engagement: {
        views: formatNumber(result.statistics?.playCount),
        likes: formatNumber(result.statistics?.likeCount),
        comments: formatNumber(result.statistics?.commentCount),
        shares: formatNumber(result.statistics?.shareCount),
        saves: formatNumber(result.statistics?.collectCount)
      },
      media: {
        type: result.type,
        video_urls: result.video ? {
          play: Array.isArray(result.video.playAddr) ? result.video.playAddr[0] : result.video.playAddr,
          download: Array.isArray(result.video.downloadAddr) ? result.video.downloadAddr[0] : result.video.downloadAddr,
          cover: Array.isArray(result.video.cover) ? result.video.cover[0] : result.video.cover
        } : null,
        images: result.images || null
      },
      music: result.music ? {
        id: result.music.id,
        title: result.music.title,
        author: result.music.author,
        url: Array.isArray(result.music.playUrl) ? result.music.playUrl[0] : result.music.playUrl,
        cover: Array.isArray(result.music.coverThumb) ? result.music.coverThumb[0] : result.music.coverThumb
      } : null
    };
  } else {
    // Fallback for v2/v3
    return {
      video_info: {
        type: result.type || 'video',
        title: result.desc || 'No title'
      },
      media: {
        type: result.type || 'video',
        video_url: result.video?.playAddr || result.direct || result.videoHD || result.url,
        images: result.images || null
      }
    };
  }
};

export const stalkUser = async (username) => {
  try {
    const result = await Tiktok.StalkUser(username);
    if (result && result.status === 'success') {
      return transformUserInfo(result);
    }
    throw new Error(result?.message || `User @${username} not found.`);
  } catch (err) {
    throw new Error(`TikTok Stalk Error: ${err.message}`);
  }
};

export const downloadVideo = async (url, version = 'v1') => {
  try {
    const result = await Tiktok.Downloader(url, { version });
    if (result && result.status === 'success') {
      return transformVideoInfo(result, version);
    }
    throw new Error(result?.message || 'Failed to download video.');
  } catch (err) {
    throw new Error(`TikTok Download Error: ${err.message}`);
  }
};

export default { stalkUser, downloadVideo };
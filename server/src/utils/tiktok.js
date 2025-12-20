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

  // TikTok API DL result for stalk usually has 'user', but we check fallbacks
  const user = result.user || result.users || result.author;
  const stats = result.stats;
  
  if (!user) {
    throw new Error('Could not extract user profile details. TikTok might be blocking the request or account is private.');
  }

  // More aggressive avatar check to handle all possible versions returned by the library
  const getAvatar = (u) => {
    // Check every known avatar key used by TikTok API responses
    const avatar = u.avatar || u.avatarThumb || u.avatar_thumb || u.avatarLarger || u.avatar_larger || u.avatarMedium;
    
    if (Array.isArray(avatar)) return avatar[0];
    if (typeof avatar === 'object' && avatar.url_list) return avatar.url_list[0];
    return avatar || null;
  };

  return {
    profile: {
      username: user.username || user.uniqueId || user.unique_id || null,
      display_name: user.nickname || null,
      bio: user.signature || user.bio || '',
      is_verified: !!(user.verified || user.is_verified),
      profile_picture: getAvatar(user),
      region: user.region || user.location || user.country || null,
      profile_url: (user.username || user.uniqueId) ? `https://www.tiktok.com/@${user.username || user.uniqueId}` : null
    },
    stats: stats ? {
      total_followers: stats.followerCount || stats.follower_count || 0,
      total_following: stats.followingCount || stats.following_count || 0,
      total_likes: stats.heartCount || stats.heart || stats.likeCount || 0,
      total_videos: stats.videoCount || stats.video_count || 0,
      engagement_rate: calculateEngagementRate(
        stats.heartCount || stats.heart || stats.likeCount || 0, 
        stats.videoCount || stats.video_count || 0,
        stats.followerCount || stats.follower_count || 0
      )
    } : null
  };
};

const transformVideoInfo = (rawData, version = 'v1') => {
  const result = rawData?.result;
  if (!result) throw new Error('Failed to retrieve video information');
  
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
    return {
      video_info: {
        type: result.type || 'video',
        title: result.desc || result.title || 'No title'
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
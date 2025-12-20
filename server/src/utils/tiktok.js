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

  // Ambil referensi objek secara eksplisit
  const u = result.user || {};
  const a = result.author || {};
  
  if (!result.user && !result.author) {
    throw new Error('Could not extract user profile details. Account might be private or blocked.');
  }

  // Logic Avatar: Cari yang tidak null/empty
  const getAvatar = () => {
    return u.avatar || a.avatar || u.avatarThumb?.[0] || a.avatarThumb?.[0] || u.avatarMedium?.[0] || null;
  };

  // Logic Region: HARUS TELITI. Cari nilai string pertama yang tersedia.
  // Kita cek user.region dulu, lalu author.region, baru fallback ke location/country.
  const getRegion = () => {
    return u.region || 
           a.region || 
           u.location || 
           a.location || 
           u.country || 
           result.region || 
           null;
  };

  const username = u.username || a.username || u.uniqueId || a.uniqueId || null;

  return {
    profile: {
      username: username,
      display_name: u.nickname || a.nickname || null,
      bio: u.signature || a.signature || u.bio || '',
      is_verified: !!(u.verified || a.verified),
      profile_picture: getAvatar(),
      region: getRegion(),
      profile_url: username ? `https://www.tiktok.com/@${username}` : null
    },
    stats: result.stats ? {
      total_followers: result.stats.followerCount || 0,
      total_following: result.stats.followingCount || 0,
      total_likes: result.stats.heartCount || result.stats.likeCount || 0,
      total_videos: result.stats.videoCount || 0,
      engagement_rate: calculateEngagementRate(
        result.stats.heartCount || result.stats.likeCount || 0, 
        result.stats.videoCount || 0,
        result.stats.followerCount || 0
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
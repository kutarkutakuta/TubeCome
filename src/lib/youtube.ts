import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

export interface FetchCommentsOptions {
  videoId: string;
  maxResults?: number;
  pageToken?: string;
}

/**
 * チャンネルIDから「アップロード済み」プレイリストIDを取得
 */
export async function getChannelUploadsPlaylistId(channelId: string): Promise<string | null> {
    try {
        const response = await youtube.channels.list({
            part: ['contentDetails'],
            id: [channelId],
        });
        
        const items = response.data.items;
        if (!items || items.length === 0) {
            return null;
        }

        return items[0].contentDetails?.relatedPlaylists?.uploads || null;
    } catch (error) {
        console.error('Error fetching channel details:', error);
        throw error;
    }
}

/**
 * プレイリストから動画リストを取得（直近N件）
 */
export async function getPlaylistVideos(playlistId: string, maxResults: number = 10) {
    try {
        const response = await youtube.playlistItems.list({
            part: ['snippet', 'contentDetails'],
            playlistId: playlistId,
            maxResults: maxResults,
        });
        
        // 動画情報の整形
        return response.data.items?.map(item => ({
            id: item.contentDetails?.videoId as string,
            title: item.snippet?.title || '',
            thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
            publishedAt: item.snippet?.publishedAt || '',
            channelId: item.snippet?.channelId || '',
            channelTitle: item.snippet?.channelTitle || '',
        })) || [];

    } catch (error) {
        console.error('Error fetching playlist items:', error);
        throw error;
    }
}

/**
 * YouTube Data API v3 を使用してコメントスレッドを取得する
 * commentThreads.list を使用
 */
export async function getCommentThreads({ videoId, maxResults = 20, pageToken }: FetchCommentsOptions) {
  try {
    const response = await youtube.commentThreads.list({
      part: ['snippet', 'replies'],
      videoId: videoId,
      maxResults: maxResults, // ユーザー要件: 取得件数には上限を設ける
      pageToken: pageToken,
      order: 'time', // 直近の動画のコメントを取得とあるが、コメント自体も新しい順が良いか?
      textFormat: 'plainText',
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching YouTube comments:', error);
    throw error;
  }
}

/**
 * 動画の詳細（snippet, contentDetails, statistics）を取得して整形して返す
 */
export async function getVideoDetails(id: string) {
  try {
    const response = await youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: [id],
    });
    const item = response.data.items && response.data.items[0];
    if (!item) return null;

    const snippet = item.snippet;
    const cd = item.contentDetails;
    const stats = item.statistics;

    return {
      id: item.id as string,
      title: snippet?.title || '',
      description: snippet?.description || '',
      thumbnail: snippet?.thumbnails?.high?.url || snippet?.thumbnails?.default?.url || '',
      channelId: snippet?.channelId || '',
      channelTitle: snippet?.channelTitle || '',
      publishedAt: snippet?.publishedAt || '',
      duration: cd?.duration || '',
      statistics: {
        viewCount: stats?.viewCount ? parseInt(stats.viewCount, 10) : undefined,
        likeCount: stats?.likeCount ? parseInt(stats.likeCount, 10) : undefined,
        commentCount: stats?.commentCount ? parseInt(stats.commentCount, 10) : undefined,
      },
    };
  } catch (err) {
    console.error('Error fetching video details:', err);
    throw err;
  }
}

// --- Video statistics helper with simple in-memory cache ---

type VideoStats = {
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
};

const statsCache = new Map<string, { data: VideoStats | null; expiresAt: number }>();
const STATS_TTL = 1000 * 60 * 10; // 10 minutes

export async function getVideoStatistics(ids: string[]): Promise<Record<string, VideoStats | null>> {
  const now = Date.now();
  const result: Record<string, VideoStats | null> = {};
  const toFetch: string[] = [];

  for (const id of ids) {
    const cached = statsCache.get(id);
    if (cached && cached.expiresAt > now) {
      result[id] = cached.data;
    } else {
      toFetch.push(id);
    }
  }

  if (toFetch.length > 0) {
    try {
      const response = await youtube.videos.list({
        part: ['statistics'],
        id: toFetch,
        maxResults: 50,
      });

      const items = response.data.items || [];
      // fill fetched data
      const fetchedMap: Record<string, VideoStats | null> = {};
      for (const item of items) {
        const stats = item.statistics;
        fetchedMap[item.id as string] = {
          viewCount: stats?.viewCount ? parseInt(stats.viewCount, 10) : undefined,
          likeCount: stats?.likeCount ? parseInt(stats.likeCount, 10) : undefined,
          commentCount: stats?.commentCount ? parseInt(stats.commentCount, 10) : undefined,
        };
      }

      // For ids not present in items, set null
      for (const id of toFetch) {
        const data = fetchedMap[id] ?? null;
        statsCache.set(id, { data, expiresAt: Date.now() + STATS_TTL });
        result[id] = data;
      }
    } catch (err) {
      console.error('Error fetching video statistics:', err);
      // On error, set null for requested ids and don't overwrite existing cache
      for (const id of toFetch) {
        const cached = statsCache.get(id);
        if (cached && cached.expiresAt > now) {
          result[id] = cached.data;
        } else {
          statsCache.set(id, { data: null, expiresAt: Date.now() + 1000 * 60 }); // short negative cache
          result[id] = null;
        }
      }
    }
  }

  return result;
}

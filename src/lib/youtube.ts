import { google } from 'googleapis';
import { decodeHtml } from '@/utils/html';
import { logYouTubeQuota } from '@/utils/supabase/serverClient';

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

    // Log quota (1 unit per commentThreads.list call)
    try { await logYouTubeQuota('commentThreads.list', 1, { videoId }); } catch (e) {}

    return response.data;
  } catch (error: any) {
    // Detect "comments disabled" errors from YouTube API and handle quietly
    const msg = String(error?.message || '').toLowerCase();
    const apiErrors = error?.errors || error?.response?.data?.error?.errors || [];
    const commentsDisabled =
      msg.includes('comments disabled') ||
      msg.includes('disabled comments') ||
      apiErrors.some((e: any) => {
        const reason = String(e?.reason || '').toLowerCase();
        const m = String(e?.message || '').toLowerCase();
        return reason.includes('commentsdisabled') || reason === 'commentsdisabled' || m.includes('disabled comments') || m.includes('comments disabled');
      });

    if (commentsDisabled) {
      // Info-level log for expected condition (less noisy during dev)
      console.info('YouTube comments disabled for video:', videoId);
      return { items: [], pageInfo: { totalResults: 0, resultsPerPage: 0 } } as any;
    }

    console.error('Error fetching YouTube comments:', error);
    throw error;
  }
}

/**
 * 複数ページのコメントを取得（最大5ページ=500件）
 */
export async function getAllCommentThreads(videoId: string, maxPages: number = 5) {
  const allItems: any[] = [];
  let pageToken: string | undefined = undefined;
  let pageCount = 0;

  try {
    while (pageCount < maxPages) {
      const response = await getCommentThreads({
        videoId,
        maxResults: 100,
        pageToken,
      });

      if (response.items && response.items.length > 0) {
        allItems.push(...response.items);
      }

      pageCount++;

      // Check if there are more pages
      if (response.nextPageToken) {
        pageToken = response.nextPageToken;
      } else {
        // No more pages
        break;
      }
    }

    return { items: allItems, totalFetched: allItems.length, pagesFetched: pageCount };
  } catch (error) {
    console.error('Error fetching all comment threads:', error);
    // Return what we've collected so far
    return { items: allItems, totalFetched: allItems.length, pagesFetched: pageCount };
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

    // Log quota for videos.list (video details)
    try { await logYouTubeQuota('videos.list_details', 1, { id }); } catch (e) {}

    const item = response.data.items && response.data.items[0];
    if (!item) return null;

    const snippet = item.snippet;
    const cd = item.contentDetails;
    const stats = item.statistics;

    return {
      id: item.id as string,
      title: decodeHtml(snippet?.title || ''),
      description: decodeHtml(snippet?.description || ''),
      thumbnail: snippet?.thumbnails?.high?.url || snippet?.thumbnails?.default?.url || '',
      channelId: snippet?.channelId || '',
      channelTitle: decodeHtml(snippet?.channelTitle || ''),
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

      // Log quota for videos.list statistics (single call covers many ids)
      try { await logYouTubeQuota('videos.list_statistics', 1, { ids: toFetch }); } catch (e) {}
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

/**
 * Find previous and next video IDs (and titles) in the channel's uploads playlist.
 * Returns null if not found or on error.
 */
export async function getPrevNextFromUploads(channelId: string, currentVideoId: string) {
  try {
    const cResp = await youtube.channels.list({ part: ['contentDetails'], id: [channelId] });

    // Log channels.list quota
    try { await logYouTubeQuota('channels.list', 1, { channelId }); } catch (e) {}

    const ch = cResp.data.items && cResp.data.items[0];
    if (!ch) return null;
    const uploadsId = ch.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsId) return null;

    let pageToken: string | undefined = undefined;
    const acc: Array<{ id?: string; title?: string }> = [];
    // iterate pages until we find the current video or exhaust some reasonable limit
    for (let page = 0; page < 20; page++) {
      const resp: any = await youtube.playlistItems.list({ part: ['snippet', 'contentDetails'], playlistId: uploadsId, maxResults: 50, pageToken });

      // Log playlistItems.list quota per page
      try { await logYouTubeQuota('playlistItems.list', 1, { playlistId: uploadsId, pageToken: pageToken || null }); } catch (e) {}

      const items = resp.data.items || [];
      for (const it of items) {
        acc.push({ id: it.contentDetails?.videoId, title: decodeHtml(it.snippet?.title || '') });
      }
      const idx = acc.findIndex(x => x.id === currentVideoId);
      if (idx >= 0) {
        const prev = idx > 0 ? acc[idx - 1] : null;
        const next = idx + 1 < acc.length ? acc[idx + 1] : null;
        return { prev, next };
      }
      pageToken = resp.data.nextPageToken || undefined;
      if (!pageToken) break;
    }

    return null;
  } catch (err) {
    console.error('Error fetching uploads playlist:', err);
    return null;
  }
}

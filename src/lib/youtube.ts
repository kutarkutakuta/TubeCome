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

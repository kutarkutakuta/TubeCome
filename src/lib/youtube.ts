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
 * YouTube Data API v3 を使用してコメントスレッドを取得する
 * commentThreads.list を使用
 */
export async function getCommentThreads({ videoId, maxResults = 20, pageToken }: FetchCommentsOptions) {
  try {
    const response = await youtube.commentThreads.list({
      part: ['snippet'],
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

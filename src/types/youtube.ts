// YouTube Data API 関連の型定義

export interface YouTubeComment {
  id: string;
  video_id: string;
  text_display: string;
  text_original: string;
  author_display_name: string;
  author_profile_image_url: string;
  author_channel_url: string;
  like_count: number;
  published_at: string;
  updated_at: string;
  parent_id?: string; // 返信の場合
}

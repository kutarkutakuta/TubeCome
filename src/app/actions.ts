'use server'

import { getCommentThreads, getChannelUploadsPlaylistId, getPlaylistVideos } from '@/lib/youtube';
import { supabase } from '@/utils/supabase/client';
import { youtube_v3 } from 'googleapis';

export interface FetchResult {
  success: boolean;
  message: string;
  count?: number;
  channelId?: string;
}

export async function fetchAndSaveComments(prevState: FetchResult, formData: FormData): Promise<FetchResult> {
  const inputId = formData.get('videoId') as string; // フォームフィールド名は使いまわしているが中身はチャンネルIDを想定

  if (!inputId) {
    return { success: false, message: 'チャンネルIDを入力してください。' };
  }

  try {
    // 1. チャンネルIDからアップロードリストIDを取得
    let playlistId = await getChannelUploadsPlaylistId(inputId);
    
    // 入力がIDでない場合、あるいは見つからない場合
    if (!playlistId) {
        return { success: false, message: 'チャンネルが見つかりませんでした。正しいチャンネルIDを入力してください (例: UC...)。' };
    }

    // 2. 直近10件の動画を取得
    const videos = await getPlaylistVideos(playlistId, 10);
    if (videos.length === 0) {
        return { success: true, message: '動画が見つかりませんでした。', count: 0 };
    }

    // 動画情報をDBに保存 (videosテーブル)
    const videosToUpsert = videos.map(v => ({
        id: v.id,
        title: v.title,
        thumbnail_url: v.thumbnail,
        channel_id: v.channelId,
        channel_title: v.channelTitle,
        published_at: v.publishedAt,
    }));

    const { error: videoError } = await supabase.from('videos').upsert(videosToUpsert, { onConflict: 'id' });
    if (videoError) {
        console.error('Error saving videos:', videoError);
    }

    let totalComments = 0;
    
    // 3. 各動画のコメントを取得・保存
    for (const video of videos) {
        try {
            const data = await getCommentThreads({ videoId: video.id, maxResults: 50 });
            
            if (!data.items || data.items.length === 0) continue;

            const commentsToUpsert = [];

            for (const item of data.items) {
                const snippet = item.snippet?.topLevelComment?.snippet;
                const id = item.snippet?.topLevelComment?.id;

                if (snippet && id) {
                    commentsToUpsert.push({
                        id: id,
                        video_id: video.id,
                        text_display: snippet.textDisplay,
                        text_original: snippet.textOriginal,
                        author_display_name: snippet.authorDisplayName,
                        author_profile_image_url: snippet.authorProfileImageUrl,
                        like_count: snippet.likeCount || 0,
                        published_at: snippet.publishedAt,
                        updated_at: snippet.updatedAt,
                    });
                }
                
                if (item.replies?.comments) {
                    for (const reply of item.replies.comments) {
                        const replySnippet = reply.snippet;
                        if (replySnippet && reply.id) {
                            commentsToUpsert.push({
                                id: reply.id,
                                video_id: video.id,
                                text_display: replySnippet.textDisplay,
                                text_original: replySnippet.textOriginal,
                                author_display_name: replySnippet.authorDisplayName,
                                author_profile_image_url: replySnippet.authorProfileImageUrl,
                                like_count: replySnippet.likeCount || 0,
                                published_at: replySnippet.publishedAt,
                                updated_at: replySnippet.updatedAt,
                            });
                        }
                    }
                }
            }

            if (commentsToUpsert.length > 0) {
                const { error } = await supabase
                  .from('comments')
                  .upsert(commentsToUpsert, { onConflict: 'id' });
                
                if (!error) {
                    totalComments += commentsToUpsert.length;
                    
                    // Edge Function 呼び出し (コメントアウトまたは有効化)
                    // await fetch(...) 
                } else {
                    console.error(`Error saving comments for video ${video.id}:`, error);
                }
            }
        } catch (err) {
            console.error(`Error processing video ${video.id}:`, err);
        }
    }

    return { 
      success: true, 
      message: `${videos.length}本の動画から合計 ${totalComments} 件のコメントを取得・保存しました。`,
      channelId: inputId,
      count: totalComments
    };

  } catch (error: any) {
    console.error('Action error:', error);
    return { success: false, message: `エラーが発生しました: ${error.message}` };
  }
}

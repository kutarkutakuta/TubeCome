import { supabase } from '@/utils/supabase/client';
import { getSentimentLevel } from '@/utils/sentiment';
import { VideoCard } from './VideoCard';
import Link from 'next/link';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getVideos(channelId?: string) {
  let query = supabase
    .from('videos')
    .select('*')
    .order('published_at', { ascending: false });

  if (channelId) {
    query = query.eq('channel_id', channelId);
  } else {
    query = query.limit(50);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
  return data;
}

async function getCommentsForVideos(videoIds: string[]) {
  if (videoIds.length === 0) return [];
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .in('video_id', videoIds)
    .order('sentiment_score', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  return data;
}

export default async function VideosPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const channelId = typeof resolvedSearchParams.channelId === 'string' ? resolvedSearchParams.channelId : undefined;
  
  const videos = await getVideos(channelId);
  const videoIds = videos.map(v => v.id);
  const allComments = await getCommentsForVideos(videoIds);

  const commentsByVideo = allComments.reduce((acc, comment) => {
    if (!acc[comment.video_id]) acc[comment.video_id] = [];
    acc[comment.video_id].push(comment);
    return acc;
  }, {} as Record<string, typeof allComments>);

  const videosWithAnalysis = videos.map(video => {
    const comments = commentsByVideo[video.id] || [];
    
    // Calculate Summary
    const summary: Record<string, number> = {
      strong_positive: 0,
      weak_positive: 0,
      neutral: 0,
      weak_negative: 0,
      strong_negative: 0,
      unknown: 0,
    };

    const commentsByLevel: Record<string, typeof comments> = {
       strong_positive: [],
       weak_positive: [],
       neutral: [],
       weak_negative: [],
       strong_negative: [], 
       unknown: []
    };

    comments.forEach(c => {
      const level = getSentimentLevel(c.sentiment_score);
      if (summary[level] !== undefined) {
          summary[level]++;
      }
      if (commentsByLevel[level]) {
          commentsByLevel[level].push(c);
      }
    });
    
    const topComments: Record<string, any[]> = {};
    
    Object.keys(commentsByLevel).forEach(level => {
        const levelComments = commentsByLevel[level] || [];
        if (level.includes('positive')) {
            levelComments.sort((a, b) => b.sentiment_score - a.sentiment_score);
        } else if (level.includes('negative')) {
            levelComments.sort((a, b) => a.sentiment_score - b.sentiment_score);
        }
        
        topComments[level] = levelComments.slice(0, 3).map(c => ({
            id: c.id,
            text_display: c.text_display,
            author_display_name: c.author_display_name,
            sentiment_score: c.sentiment_score
        }));
    });

    return {
      ...video,
      analysis: {
        summary,
        topComments
      }
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
           <Link href="/" className="text-blue-600 hover:underline mb-2 inline-block">← トップに戻る</Link>
           <h1 className="text-2xl font-bold text-gray-900">
             {channelId ? 'チャンネル動画分析結果' : '保存済み動画一覧'}
           </h1>
           {channelId && <p className="text-gray-500 text-sm mt-1">Channel ID: {channelId}</p>}
        </header>

        <div className="space-y-8">
            {videosWithAnalysis.length === 0 ? (
                <div className="bg-white p-8 rounded text-center text-gray-500">
                    表示する動画がありません。トップページから取得してください。
                </div>
            ) : (
                videosWithAnalysis.map(video => (
                    <VideoCard key={video.id} video={video} />
                ))
            )}
        </div>
      </div>
    </div>
  );
}

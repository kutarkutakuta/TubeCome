// src/app/videos/[id]/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/utils/supabase/client';

export const revalidate = 0;

interface Params {
    params: Promise<{ id: string }>;
}

async function getVideoDetails(id: string) {
    const { data } = await supabase.from('videos').select('*').eq('id', id).single();
    return data;
}

async function getComments(id: string) {
    // 感情スコアなどで並び替えも可能だが、まずは時系列またはスコア順
    // ネガティブなコメントを上位にするなどの分析的ビューも考えられる
    const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('video_id', id)
        .order('published_at', { ascending: false }); // 新しい順
    return data || [];
}

export default async function VideoDetailPage({ params }: Params) {
    const { id } = await params;
    const video = await getVideoDetails(id);
    const comments = await getComments(id);

    // 簡易的な感情分析集計 (本来はDB側で集計するか、Edge Functionで保存した結果を使う)
    // ここではsentiment_scoreが入っている前提でモック集計
    // sentiment_score が 0〜1 (ポジティブ度) とするか、-1〜1 とするかによるが
    // TensorFlow/BERT モデル次第。ここでは仮に「ポジティブ」「ネガティブ」「中立」ラベルがあるとする
    
    const sentimentCounts = comments.reduce((acc: any, c: any) => {
        const label = c.sentiment_label || 'UNANALYZED';
        acc[label] = (acc[label] || 0) + 1;
        return acc;
    }, {});

    const total = comments.length;
    const positive = sentimentCounts['POSITIVE'] || sentimentCounts['5 stars'] || 0;
    const negative = sentimentCounts['NEGATIVE'] || sentimentCounts['1 star'] || 0;
    // const neutral = total - positive - negative; // 残り

    const positivePercentage = total > 0 ? Math.round((positive / total) * 100) : 0;
    const negativePercentage = total > 0 ? Math.round((negative / total) * 100) : 0;

    return (
        <div className="min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)] max-w-4xl mx-auto">
            <header className="mb-6">
                <Link href="/videos" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
                    ← 動画一覧に戻る
                </Link>
                {video ? (
                    <div className="flex gap-4 flex-col sm:flex-row items-start">
                        <div className="w-full sm:w-48 aspect-video relative rounded bg-gray-200 flex-shrink-0">
                           {video.thumbnail_url && (
                             <Image 
                               src={video.thumbnail_url} 
                               alt={video.title} 
                               fill 
                               className="object-cover rounded" 
                             />
                           )}
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-2">
                                {video.title}
                            </h1>
                            <p className="text-gray-600 text-sm">{video.channel_title}</p>
                            <p className="text-gray-500 text-xs mt-1">
                                {new Date(video.published_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ) : (
                    <h1 className="text-2xl font-bold text-red-600">動画情報が見つかりません</h1>
                )}
            </header>

            {/* 感情グラフ (簡易バー) */}
            <section className="bg-white p-6 rounded-lg border shadow-sm mb-8">
                <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
                    <span>感情分析サマリー</span>
                    <span className="text-sm font-normal text-gray-500">全 {total} 件</span>
                </h2>
                
                <div className="space-y-4">
                    {/* ポジティブバー */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-green-700">ポジティブ</span>
                            <span>{positivePercentage}% ({positive})</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${positivePercentage}%` }}></div>
                        </div>
                    </div>

                    {/* ネガティブバー */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-red-700">ネガティブ</span>
                            <span>{negativePercentage}% ({negative})</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${negativePercentage}%` }}></div>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-4 text-right">
                    ※ Edge Functionによる分析結果に基づきます (未分析はUNANALYZED)
                </p>
            </section>

            {/* コメント一覧 */}
            <section>
                <h2 className="text-lg font-bold mb-4">コメント一覧</h2>
                <div className="space-y-4">
                    {comments.map((comment: any) => (
                        <div key={comment.id} className="p-4 bg-white border rounded-lg shadow-sm">
                            <div className="flex items-start gap-3">
                                {comment.author_profile_image_url && (
                                    <img 
                                      src={comment.author_profile_image_url} 
                                      alt="" 
                                      className="w-10 h-10 rounded-full"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-sm truncate pr-2">
                                            {comment.author_display_name}
                                        </span>
                                        <span className="text-xs text-gray-500 flex-shrink-0">
                                            {new Date(comment.published_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                                        {comment.text_display}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            👍 {comment.like_count}
                                        </div>
                                        {comment.sentiment_label && (
                                            <div className={`text-xs px-2 py-0.5 rounded-full border ${
                                                comment.sentiment_label?.includes('POSITIVE') || comment.sentiment_label?.includes('5 star') ? 'bg-green-100 text-green-800 border-green-200' :
                                                comment.sentiment_label?.includes('NEGATIVE') || comment.sentiment_label?.includes('1 star') ? 'bg-red-100 text-red-800 border-red-200' :
                                                'bg-gray-100 text-gray-800 border-gray-200'
                                            }`}>
                                                {comment.sentiment_label} ({Math.round((comment.sentiment_score || 0) * 100)}%)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

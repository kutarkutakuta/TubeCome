'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SENTIMENT_CONFIG } from '@/utils/sentiment';

interface Comment {
    id: string;
    text_display: string;
    author_display_name: string;
    sentiment_score: number;
}

interface VideoCardProps {
    video: {
        id: string;
        title: string;
        thumbnail_url: string;
        channel_title: string;
        published_at: string;
        analysis: {
            summary: any;
            topComments: Record<string, Comment[]>;
        };
    };
}

export function VideoCard({ video }: VideoCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { summary, topComments } = video.analysis;

    const total = summary ? Object.values(summary).reduce((a: any, b: any) => a + (typeof b === 'number' ? b : 0), 0) : 0;

    if (!summary) {
        return (
            <article className="border rounded-lg bg-white shadow-sm p-4 flex gap-4">
                <div className="w-32 aspect-video relative flex-shrink-0 bg-gray-200">
                     {video.thumbnail_url && <Image src={video.thumbnail_url} alt="" fill className="object-cover rounded" />}
                </div>
                <div>
                     <h2 className="font-bold text-gray-800">{video.title}</h2>
                     <p className="text-sm text-gray-500">コメントデータなし</p>
                </div>
            </article>
        );
    }

    return (
        <article className="border rounded-lg bg-white shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-6">
                {/* 左: 動画情報 */}
                <div className="flex-shrink-0 md:w-1/3 flex flex-col gap-2">
                    <Link href={`/videos/${video.id}`} className="group block">
                        <div className="aspect-video relative bg-black rounded overflow-hidden">
                            {video.thumbnail_url && (
                                <Image
                                    src={video.thumbnail_url}
                                    alt={video.title}
                                    fill
                                    className="object-cover group-hover:opacity-90 transition-opacity"
                                />
                            )}
                        </div>
                        <h2 className="font-bold text-gray-900 mt-2 text-lg group-hover:text-blue-600 leading-snug">
                            {video.title}
                        </h2>
                    </Link>
                    <div className="text-sm text-gray-500">
                        <p>{video.channel_title}</p>
                        <p>{new Date(video.published_at).toLocaleDateString()}</p>
                    </div>
                    <Link 
                        href={`/videos/${video.id}`}
                        className="mt-auto text-center w-full py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                    >
                        詳細・全コメントを見る
                    </Link>
                </div>

                {/* 右: 感情サマリー */}
                <div className="flex-grow flex flex-col">
                    <h3 className="font-bold text-gray-800 mb-3 flex justify-between items-center">
                        <span>感情分析サマリー</span>
                        <span className="text-xs font-normal text-gray-500">コメント総数: {total}</span>
                    </h3>
                    
                    {/* バーチャート */}
                    <div className="flex h-4 rounded-full overflow-hidden w-full bg-gray-100 mb-4">
                       {Object.entries(SENTIMENT_CONFIG).map(([key, config]) => {
                           if (key === 'unknown') return null; // unknownはバーに含めないか、グレーにするか
                           const count = summary[key] || 0;
                           if (count === 0) return null;
                           const width = total > 0 ? (count / total) * 100 : 0;
                           
                           // バーの色はTailwindクラスだと動的指定難しいのでstyleで簡易対応するか、configにhexを持たせる
                           // ここでは簡易的にクラス名から色を推測してstyleにマップするか、あるいは固定カラー
                           const colors: Record<string, string> = {
                               strong_positive: '#15803d', // green-700
                               weak_positive: '#4ade80',   // green-400
                               neutral: '#d1d5db',         // gray-300
                               weak_negative: '#f87171',   // red-400
                               strong_negative: '#b91c1c', // red-700
                           };

                           return (
                               <div 
                                   key={key} 
                                   style={{ width: `${width}%`, backgroundColor: colors[key] }}
                                   title={`${config.label}: ${count}件`}
                               />
                           );
                       })}
                    </div>

                    {/* レジェンド & カウント */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                        {Object.entries(SENTIMENT_CONFIG).map(([key, config]) => {
                            if (key === 'unknown' && summary.unknown === 0) return null;
                             const count = summary[key] || 0;
                            return (
                                <div key={key} className={`flex items-center gap-1.5 text-xs p-1.5 rounded ${config.bg}`}>
                                    <span>{config.icon}</span>
                                    <span className={`font-medium ${config.color.replace('text-', 'text-')}`}>{config.label}</span>
                                    <span className="ml-auto font-bold text-gray-700">{count}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* アコーディオンボタン */}
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="mt-auto text-sm text-gray-600 flex items-center justify-center gap-2 py-2 w-full hover:bg-gray-100 rounded transition-colors"
                    >
                        {isOpen ? '▲ トップコメントを隠す' : '▼ 各レベルのトップコメントを表示'}
                    </button>
                </div>
            </div>

            {/* アコーディオン中身 */}
            {isOpen && (
                <div className="border-t bg-gray-50 p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                     {Object.entries(SENTIMENT_CONFIG).map(([key, config]) => {
                         if (key === 'unknown') return null;
                         const comments = topComments[key];
                         if (!comments || comments.length === 0) return null;

                         return (
                             <div key={key} className="bg-white rounded border p-3">
                                 <h4 className={`text-xs font-bold mb-2 flex items-center gap-1 ${config.color}`}>
                                     {config.icon} {config.label} Top 3
                                 </h4>
                                 <ul className="space-y-2">
                                     {comments.map((c) => (
                                         <li key={c.id} className="text-xs text-gray-700 border-b last:border-0 pb-1 last:pb-0">
                                             <div className="flex justify-between text-gray-500 text-[10px] mb-0.5">
                                                 <span className="truncate max-w-[100px]">{c.author_display_name}</span>
                                                 <span>Score: {c.sentiment_score?.toFixed(2)}</span>
                                             </div>
                                             <p className="line-clamp-2" title={c.text_display}>{c.text_display}</p>
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                         );
                     })}
                </div>
            )}
        </article>
    );
}

import React from 'react';
import VideoCard from '../components/VideoCard';

export default function Home() {
  const videos = [
    { id: 'v1', title: 'Retro UI を作ってみた', channel: 'レトロちゃんねる', views: '12,345', comments: 124, date: '2026/01/07' },
    { id: 'v2', title: 'Next.js でレトロテーマを切り替える', channel: 'フロントくん', views: '8,901', comments: 45, date: '2026/01/06' },
    { id: 'v3', title: '懐かしの2ch UIを再現してみた', channel: 'UI職人', views: '56,789', comments: 567, date: '2026/01/05' },
    { id: 'v4', title: 'おすすめテキストエディタ（2026）', channel: 'エディタ速報', views: '1,234', comments: 12, date: '2026/01/04' },
    { id: 'v5', title: '深夜の雑談ライブ', channel: '雑談部', views: '3,210', comments: 78, date: '2026/01/03' },
  ];

  return (
    <div className='p-3 md:p-6 max-w-xl mx-auto'>
      {/* App Header (mobile feel) */}
      <div className='win-window win-title-bar mb-4 flex items-center justify-between'>
        <div className='text-sm font-bold'>TubeCome</div>
        <div className='text-xs text-[var(--fg-secondary)]'>スマホアプリ風コメントビューアー</div>
      </div>

      {/* Video List (mobile-first cards) */}
      <div className='space-y-3'>
        {videos.map((v) => (
          <VideoCard key={v.id} v={v} />
        ))}
      </div>

      {/* Footer space for mobile bottom nav */}
      <div className='h-20'></div>
    </div>
  );
}



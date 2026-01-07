'use client';

import React, { useEffect, useState } from 'react';
import { addFavorite, getFavorites, removeFavorite } from '../utils/favorites';
import { isFavorite } from '@/utils/indexeddb';

type Video = {
  id: string;
  title: string;
  channel: string;
  views: string;
  comments: number;
  date: string;
};

export default function VideoCard({ v }: { v: Video }) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    let mounted = true;
    isFavorite(v.channel).then(f => { if (mounted) setIsFav(f); }).catch(()=>{});
    return ()=>{ mounted = false };
  }, [v.channel]);

  async function toggle() {
    try {
      if (isFav) {
        await import('@/utils/indexeddb').then(m => m.removeFavorite(v.channel));
      } else {
        await import('@/utils/indexeddb').then(m => m.addFavorite(v.channel, v.channel));
      }
    } catch (e) {
      // fallback to localStorage
      if (isFav) removeFavorite(v.channel);
      else addFavorite(v.channel);
    }
    setIsFav(!isFav);
    window.dispatchEvent(new CustomEvent('favorites-changed'));
  }

  return (
    <div className="win-window win-inset p-3 flex items-start gap-3">
      <div className="w-20 h-12 md:w-28 md:h-16 bg-[var(--bg-panel)] win-outset flex items-center justify-center text-xs font-mono">
        サムネ
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold text-[var(--fg-primary)]">{v.title}</div>
        <div className="text-xs text-[var(--fg-secondary)] mt-1">{v.channel} • {v.views} 回視聴 • {v.date}</div>
        <div className="mt-3 flex gap-2">
          <button className="win-btn text-xs" onClick={toggle}>{isFav ? 'お気に入り解除' : '保存'}</button>
          <button className="win-btn text-xs">コメントを表示 ({v.comments})</button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button } from 'antd';
import { StarOutlined, StarFilled, MessageOutlined } from '@ant-design/icons';
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
    <Card size="small" style={{ marginBottom: 16 }} bodyStyle={{ padding: 12 }}>
      <div className="flex items-start gap-3">
        <div className="w-20 h-12 md:w-28 md:h-16 bg-gray-200 flex items-center justify-center text-xs text-gray-500 rounded font-mono">
          サムネ
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold line-clamp-2">{v.title}</div>
          <div className="text-xs text-gray-500 mt-1">{v.channel} • {v.views} 回視聴 • {v.date}</div>
          <div className="mt-2 flex gap-2">
            <Button 
               size="small" 
               type={isFav ? 'default' : 'dashed'}
               icon={isFav ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
               onClick={toggle}
            >
              {isFav ? '登録済' : '保存'}
            </Button>
            <Button size="small" icon={<MessageOutlined />}>
              ({v.comments})
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

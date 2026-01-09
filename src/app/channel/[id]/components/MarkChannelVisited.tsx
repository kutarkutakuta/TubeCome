"use client";
import { useEffect } from 'react';
import { markChannelVisited } from '@/utils/indexeddb';

export default function MarkChannelVisited({ channelId }: { channelId: string }) {
  useEffect(() => {
    // 3秒後に訪問記録を更新（その間に「新」バッジが表示される）
    const timer = setTimeout(() => {
      markChannelVisited(channelId).catch(err => {
        console.error('Failed to mark channel as visited:', err);
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [channelId]);

  return null;
}

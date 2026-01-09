"use client";
import { useEffect, useState } from 'react';
import { Badge } from 'antd';
import { getViewedCommentIds } from '@/utils/indexeddb';

export default function CommentBadgeClient({ videoId, currentCount }: { videoId: string; currentCount?: number }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (typeof currentCount !== 'number' || currentCount === 0) return;
    
    getViewedCommentIds(videoId).then(viewedIds => {
      if (viewedIds === null || viewedIds.length === 0) {
        // 未訪問: コメント数全体を表示
        setUnreadCount(currentCount);
      } else {
        // 既読済みの数を引く
        const viewedCount = viewedIds.length;
        const unread = Math.max(0, currentCount - viewedCount);
        setUnreadCount(unread);
      }
    }).catch(err => {
      console.error('Failed to get viewed comment IDs:', err);
    });
  }, [videoId, currentCount]);

  if (unreadCount === 0) return null;

  return <Badge count={unreadCount} color="#faad14" overflowCount={99} />;
}

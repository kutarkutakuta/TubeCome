"use client";
import { useEffect, useState } from 'react';
import { Badge } from 'antd';
import { getMaxViewedIndex, getActualCommentCount } from '@/utils/indexeddb';

export default function UnreadCountBadge({ videoId, currentCount }: { videoId: string; currentCount?: number }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function calculateUnread() {
      try {
        // Get actual fetched comment count from IndexedDB
        const actualCount = await getActualCommentCount(videoId);
        if (actualCount === null || actualCount === 0) {
          // 未訪問 or コメントなし
          setUnreadCount(0);
          return;
        }
        
        const maxIndex = await getMaxViewedIndex(videoId);
        if (maxIndex === null) {
          // 未訪問: 実際のコメント数全体を表示
          setUnreadCount(actualCount);
        } else {
          // 最大コメントインデックスから最大既読インデックスまでの差分
          // actualCount - 1 が最大インデックス（0始まり）
          const unread = Math.max(0, actualCount - 1 - maxIndex);
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error('Failed to calculate unread count:', err);
      }
    }
    
    calculateUnread();
  }, [videoId, currentCount]);

  if (unreadCount === 0) return null;

  return <Badge count={unreadCount} color="#1890ff" overflowCount={999} />;
}

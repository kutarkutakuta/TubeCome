"use client";
import { useEffect, useState } from 'react';
import { Badge } from 'antd';
import { getPreviousCommentCount, getMaxViewedIndex, getActualCommentCount } from '@/utils/indexeddb';

export default function CommentBadgeClient({ videoId, currentCount }: { videoId: string; currentCount?: number }) {
  const [newCommentCount, setNewCommentCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function calculateBadges() {
      try {
        // Calculate new comment count (from previous visit)
        if (typeof currentCount === 'number' && currentCount > 0) {
          const previousCount = await getPreviousCommentCount(videoId);
          if (previousCount === null) {
            // 未訪問: コメント数全体を表示
            setNewCommentCount(currentCount);
          } else {
            // 前回からの差分を表示
            const diff = Math.max(0, currentCount - previousCount);
            setNewCommentCount(diff);
          }
        }
        
        // Calculate unread count (from max viewed index)
        const actualCount = await getActualCommentCount(videoId);
        if (actualCount !== null && actualCount > 0) {
          const maxIndex = await getMaxViewedIndex(videoId);
          if (maxIndex === null) {
            // 未訪問: 実際のコメント数全体を表示
            setUnreadCount(actualCount);
          } else {
            // 最大コメントインデックスから最大既読インデックスまでの差分
            const unread = Math.max(0, actualCount - 1 - maxIndex);
            setUnreadCount(unread);
          }
        }
      } catch (err) {
        console.error('Failed to calculate badge counts:', err);
      }
    }
    
    calculateBadges();
  }, [videoId, currentCount]);

  if (newCommentCount === 0 && unreadCount === 0) return null;

  const badgeText = [];
  if (newCommentCount > 0) badgeText.push(`新:${newCommentCount}`);
  if (unreadCount > 0) badgeText.push(`未:${unreadCount}`);
  
  return <Badge count={badgeText.join(' ')} color="#faad14" overflowCount={999} />;
}

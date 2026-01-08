"use client";
import { useEffect, useState } from 'react';
import { Badge } from 'antd';
import { getMaxViewedCommentNumber } from '@/utils/indexeddb';

export default function CommentBadgeClient({ videoId, currentCount }: { videoId: string; currentCount?: number }) {
  const [newCommentCount, setNewCommentCount] = useState(0);

  useEffect(() => {
    if (typeof currentCount !== 'number' || currentCount === 0) return;
    
    getMaxViewedCommentNumber(videoId).then(maxViewed => {
      if (maxViewed === null) {
        // 初回閲覧: コメント数全体を表示
        setNewCommentCount(currentCount);
      } else if (currentCount > maxViewed) {
        // 前回閲覧以降の新着分を表示
        setNewCommentCount(currentCount - maxViewed);
      }
    }).catch(err => {
      console.error('Failed to get max viewed comment number:', err);
    });
  }, [videoId, currentCount]);

  if (newCommentCount === 0) return null;

  return <Badge count={newCommentCount} color="#faad14" overflowCount={99} />;
}

"use client";
import { useEffect } from 'react';
import { getMaxViewedCommentNumber } from '@/utils/indexeddb';

export default function LastViewedMarker({ videoId }: { videoId: string }) {
  useEffect(() => {
    getMaxViewedCommentNumber(videoId).then(maxViewed => {
      if (maxViewed === null || maxViewed === 0) return;
      
      // Find the comment element with number = maxViewed + 1 (first unread)
      const nextCommentEl = document.querySelector(`[data-comment-num="${maxViewed + 1}"]`);
      
      if (nextCommentEl) {
        // Check if marker already exists
        const existingMarker = document.getElementById('last-viewed-marker');
        if (existingMarker) existingMarker.remove();
        
        // Create marker element
        const marker = document.createElement('div');
        marker.id = 'last-viewed-marker';
        marker.className = 'my-4 py-2 px-4 text-center text-sm font-bold text-white bg-gradient-to-r from-pink-400 to-pink-600 rounded-lg shadow-md';
        marker.textContent = '━━━━━ ここまで読んだ ━━━━━';
        
        // Insert before the first unread comment
        nextCommentEl.parentNode?.insertBefore(marker, nextCommentEl);
      }
    }).catch(err => {
      console.error('Failed to insert last viewed marker:', err);
    });
  }, [videoId]);

  return null;
}

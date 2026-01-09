"use client";
import { useEffect } from 'react';
import { getMaxViewedCommentNumber } from '@/utils/indexeddb';

export default function LastViewedMarker({ videoId }: { videoId: string }) {
  useEffect(() => {
    getMaxViewedCommentNumber(videoId).then(maxViewed => {
      if (maxViewed === null || maxViewed === 0) return;
      
      // Check if marker already exists
      const existingMarker = document.getElementById('last-viewed-marker');
      if (existingMarker) existingMarker.remove();
      
      // Find the comment element with number = maxViewed + 1 (first unread)
      const nextCommentEl = document.querySelector(`[data-comment-num="${maxViewed + 1}"]`);
      
      let insertTarget: Element | null = null;
      let insertBefore = true;
      
      if (nextCommentEl) {
        // There are unread comments - insert before the first unread
        insertTarget = nextCommentEl;
        insertBefore = true;
      } else {
        // All comments are read - insert after the last comment
        const lastCommentEl = document.querySelector(`[data-comment-num="${maxViewed}"]`);
        if (lastCommentEl) {
          insertTarget = lastCommentEl;
          insertBefore = false;
        }
      }
      
      if (insertTarget) {
        // Create marker element
        const marker = document.createElement('div');
        marker.id = 'last-viewed-marker';
        marker.className = 'my-4 py-2 px-4 text-center text-sm font-bold text-white bg-gradient-to-r from-pink-400 to-pink-600 rounded-lg shadow-md';
        marker.textContent = '━━━━━ ここまで読んだ ━━━━━';
        
        // Insert marker
        if (insertBefore) {
          insertTarget.parentNode?.insertBefore(marker, insertTarget);
        } else {
          insertTarget.parentNode?.insertBefore(marker, insertTarget.nextSibling);
        }
        
        // Auto-scroll to marker after a brief delay
        setTimeout(() => {
          marker.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }).catch(err => {
      console.error('Failed to insert last viewed marker:', err);
    });
  }, [videoId]);

  return null;
}
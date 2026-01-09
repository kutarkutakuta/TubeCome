"use client";
import { useEffect } from 'react';
import { getViewedCommentIds } from '@/utils/indexeddb';

export default function LastViewedMarker({ videoId, allCommentIds }: { videoId: string; allCommentIds: string[] }) {
  useEffect(() => {
    getViewedCommentIds(videoId).then(viewedIds => {
      if (!viewedIds || viewedIds.length === 0) return;
      
      const viewedSet = new Set(viewedIds);
      
      // Check if marker already exists
      const existingMarker = document.getElementById('last-viewed-marker');
      if (existingMarker) existingMarker.remove();
      
      // Find the first unread comment
      let firstUnreadId: string | null = null;
      for (const commentId of allCommentIds) {
        if (!viewedSet.has(commentId)) {
          firstUnreadId = commentId;
          break;
        }
      }
      
      let insertTarget: Element | null = null;
      let insertBefore = true;
      
      if (firstUnreadId) {
        // There are unread comments - insert before the first unread
        insertTarget = document.querySelector(`[data-comment-id="${firstUnreadId}"]`);
        insertBefore = true;
      } else {
        // All comments are read - insert after the last comment
        const lastCommentId = allCommentIds[allCommentIds.length - 1];
        if (lastCommentId) {
          insertTarget = document.querySelector(`[data-comment-id="${lastCommentId}"]`);
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
  }, [videoId, allCommentIds]);

  return null;
}
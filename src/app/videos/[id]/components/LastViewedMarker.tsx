"use client";
import { useEffect } from 'react';
import { getViewedCommentIds } from '@/utils/indexeddb';

export default function LastViewedMarker({ videoId, allCommentIds }: { videoId: string; allCommentIds: string[] }) {
  useEffect(() => {
    // Helper to wait until comment elements render (up to timeout)
    function waitForCommentsCount(expected: number, timeout = 1000) {
      return new Promise<void>((resolve) => {
        const start = Date.now();
        const check = () => {
          const count = document.querySelectorAll('[data-comment-id]').length;
          if (count >= Math.min(expected, 1) || Date.now() - start > timeout) {
            resolve();
          } else {
            setTimeout(check, 50);
          }
        };
        check();
      });
    }

    (async () => {
      try {
        const viewedIds = await getViewedCommentIds(videoId);
        if (!viewedIds || viewedIds.length === 0) return;

        const viewedSet = new Set(viewedIds.map(String));

        // Ensure comment elements are present in DOM (helps on mobile / lazy render)
        await waitForCommentsCount(allCommentIds.length, 1000);

        // Remove any existing marker
        const existingMarker = document.getElementById('last-viewed-marker');
        if (existingMarker) existingMarker.remove();

        // Use DOM order to find first unread element
        const commentEls = Array.from(document.querySelectorAll('[data-comment-id]')) as Element[];
        let insertTarget: Element | null = null;
        let insertBefore = true;

        for (const el of commentEls) {
          const id = el.getAttribute('data-comment-id');
          if (!id) continue;
          if (!viewedSet.has(String(id))) {
            insertTarget = el;
            insertBefore = true;
            break;
          }
        }

        // If all were viewed (or no DOM unread found), place marker after last comment element
        if (!insertTarget && commentEls.length > 0) {
          insertTarget = commentEls[commentEls.length - 1];
          insertBefore = false;
        }

        if (insertTarget) {
          const marker = document.createElement('div');
          marker.id = 'last-viewed-marker';
          marker.className = 'my-4 py-2 px-4 text-center text-sm font-bold text-white bg-gradient-to-r from-pink-400 to-pink-600 rounded-lg shadow-md';
          marker.textContent = '━━━━━ ここまで読んだ ━━━━━';

          if (insertBefore) {
            insertTarget.parentNode?.insertBefore(marker, insertTarget);
          } else {
            insertTarget.parentNode?.insertBefore(marker, insertTarget.nextSibling);
          }

          setTimeout(() => {
            marker.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      } catch (err) {
        console.error('Failed to insert last viewed marker:', err);
      }
    })();
  }, [videoId, allCommentIds]);

  return null;
}
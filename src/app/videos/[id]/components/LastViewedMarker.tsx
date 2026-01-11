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

        // Find the LAST viewed comment in DOM order (max position)
        const commentEls = Array.from(document.querySelectorAll('[data-comment-id]')) as Element[];
        let lastViewedEl: Element | null = null;

        for (const el of commentEls) {
          const id = el.getAttribute('data-comment-id');
          if (id && viewedSet.has(String(id))) {
            lastViewedEl = el; // Keep updating to find the last one
          }
        }

        // Place marker AFTER the last viewed comment (next position)
        if (lastViewedEl) {
          const marker = document.createElement('div');
          marker.id = 'last-viewed-marker';
          marker.className = 'my-4 py-2 px-4 text-center text-sm font-bold text-white bg-gradient-to-r from-pink-400 to-pink-600 rounded-lg shadow-md';
          marker.textContent = '━━━━━ ここまで読んだ ━━━━━';

          // Insert after the last viewed comment
          lastViewedEl.parentNode?.insertBefore(marker, lastViewedEl.nextSibling);

          setTimeout(() => {
            marker.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      } catch (err) {
        console.error('Failed to insert last viewed marker:', err);
      }
    })();

    // Listen for viewed-comments-changed event (e.g., reset)
    async function onViewedChanged(e: any) {
      if (!e?.detail?.videoId) return;
      if (e.detail.videoId !== videoId) return;
      
      // Check if viewed IDs are empty (reset)
      const viewedIds = await getViewedCommentIds(videoId);
      if (!viewedIds || viewedIds.length === 0) {
        const marker = document.getElementById('last-viewed-marker');
        if (marker) marker.remove();
      }
    }

    window.addEventListener('viewed-comments-changed', onViewedChanged as EventListener);
    return () => {
      window.removeEventListener('viewed-comments-changed', onViewedChanged as EventListener);
    };
  }, [videoId, allCommentIds]);

  return null;
}
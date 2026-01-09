"use client";
import { useEffect, useRef } from 'react';
import { saveViewedCommentIds, getPreviousCommentCount, saveVideoCommentCount, getViewedCommentIds } from '@/utils/indexeddb';

export default function SaveVideoStats({ videoId, totalComments, allCommentIds }: { videoId: string; totalComments: number; allCommentIds: string[] }) {
  const viewedIdsRef = useRef(new Set<string>());
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load previously viewed comment IDs
    async function loadViewedIds() {
      const ids = await getViewedCommentIds(videoId);
      if (ids) {
        viewedIdsRef.current = new Set(ids);
      }
    }
    loadViewedIds();

    // Save comment count if it has changed
    async function updateCommentCount() {
      try {
        const previousCount = await getPreviousCommentCount(videoId);
        if (previousCount === null || previousCount !== totalComments) {
          // Comment count has changed or is being saved for the first time
          await saveVideoCommentCount(videoId, totalComments);
        }
      } catch (err) {
        console.error('Failed to save comment count:', err);
      }
    }
    updateCommentCount();

    // Use IntersectionObserver to detect when comments enter viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const commentId = entry.target.getAttribute('data-comment-id');
            if (commentId && !viewedIdsRef.current.has(commentId)) {
              viewedIdsRef.current.add(commentId);
              
              // Throttle DB saves: only save every 2 seconds
              if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
              }
              
              saveTimerRef.current = setTimeout(() => {
                saveViewedCommentIds(videoId, Array.from(viewedIdsRef.current)).catch(err => {
                  console.error('Failed to save viewed comment IDs:', err);
                });
              }, 2000);
            }
          }
        });
      },
      { threshold: 0.5 } // 50% visible to count
    );

    // Observe all comment elements
    const commentElements = document.querySelectorAll('[data-comment-id]');
    commentElements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        // Save final state on unmount
        if (viewedIdsRef.current.size > 0) {
          saveViewedCommentIds(videoId, Array.from(viewedIdsRef.current)).catch(() => {});
        }
      }
    };
  }, [videoId, totalComments, allCommentIds]);

  return null;
}

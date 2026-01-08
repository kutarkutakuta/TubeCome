"use client";
import { useEffect, useRef } from 'react';
import { saveViewedCommentNumber } from '@/utils/indexeddb';

export default function SaveVideoStats({ videoId, totalComments }: { videoId: string; totalComments: number }) {
  const maxViewedRef = useRef(0);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Use IntersectionObserver to detect when comments enter viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const commentNum = parseInt(entry.target.getAttribute('data-comment-num') || '0', 10);
            if (commentNum > maxViewedRef.current) {
              maxViewedRef.current = commentNum;
              
              // Throttle DB saves: only save every 2 seconds
              if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
              }
              
              saveTimerRef.current = setTimeout(() => {
                saveViewedCommentNumber(videoId, maxViewedRef.current).catch(err => {
                  console.error('Failed to save viewed comment number:', err);
                });
              }, 2000);
            }
          }
        });
      },
      { threshold: 0.5 } // 50% visible to count
    );

    // Observe all comment elements
    const commentElements = document.querySelectorAll('[data-comment-num]');
    commentElements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        // Save final state on unmount
        if (maxViewedRef.current > 0) {
          saveViewedCommentNumber(videoId, maxViewedRef.current).catch(() => {});
        }
      }
    };
  }, [videoId]);

  return null;
}

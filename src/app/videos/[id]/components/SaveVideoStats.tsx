"use client";
import { useEffect, useRef } from 'react';
import { saveViewedCommentIds, getPreviousCommentCount, saveVideoCommentCount, getViewedCommentIds, saveMaxViewedIndex, saveActualCommentCount } from '@/utils/indexeddb';

export default function SaveVideoStats({ videoId, totalComments, allCommentIds }: { videoId: string; totalComments: number; allCommentIds: string[] }) {
  const viewedIdsRef = useRef(new Set<string>());
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Do not mark as viewed until the user explicitly interacts (scroll/wheel/touch/keydown/click)
  const userInteractedRef = useRef(false);

  useEffect(() => {
    // Mark that the user interacted (scrolling, wheel, touch, keydown, or click)
    function handleUserInteraction(e?: Event) {
      if (!userInteractedRef.current) userInteractedRef.current = true;
    }

    function checkScrollForMovement() {
      if (window.scrollY && window.scrollY > 10) {
        handleUserInteraction();
      }
    }

    window.addEventListener('scroll', checkScrollForMovement, { passive: true });
    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('click', handleUserInteraction);

    // Load previously viewed comment IDs
    async function loadViewedIds() {
      const ids = await getViewedCommentIds(videoId);
      if (ids) {
        viewedIdsRef.current = new Set(ids);
      }
    }
    loadViewedIds();

    // Check if page has scrollbar and auto-enable viewed tracking if not
    async function checkScrollbarAndInit() {
      // Wait for DOM to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      // If no scrollbar or scrollable height is very small (less than 200px), auto-enable viewed tracking
      if (scrollableHeight < 200) {
        userInteractedRef.current = true;
        
        // Manually trigger viewed marking for all currently visible comments
        const commentElements = document.querySelectorAll('[data-comment-id]');
        commentElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          const isFullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
          
          if (isFullyVisible) {
            const commentId = el.getAttribute('data-comment-id');
            if (commentId && !viewedIdsRef.current.has(commentId)) {
              viewedIdsRef.current.add(commentId);
            }
          }
        });
        
        // Save the viewed IDs
        if (viewedIdsRef.current.size > 0) {
          const viewedIds = Array.from(viewedIdsRef.current);
          await saveViewedCommentIds(videoId, viewedIds);
          
          let maxIndex = -1;
          for (const id of viewedIds) {
            const idx = allCommentIds.indexOf(id);
            if (idx > maxIndex) maxIndex = idx;
          }
          if (maxIndex >= 0) {
            await saveMaxViewedIndex(videoId, maxIndex);
          }
        }
      }
    }
    checkScrollbarAndInit();

    // Update in-memory viewed IDs if another component changes them (e.g., reset button)
    function onViewedChanged(e: any) {
      if (!e?.detail?.videoId) return;
      if (e.detail.videoId !== videoId) return;
      (async () => {
        try {
          const ids = await getViewedCommentIds(videoId);
          viewedIdsRef.current = new Set(ids || []);
          // Cancel any pending save to avoid overwriting the cleared state
          if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
            saveTimerRef.current = null;
          }
        } catch (err) {
          console.error('Failed to refresh viewed IDs after change:', err);
        }
      })();
    }
    window.addEventListener('viewed-comments-changed', onViewedChanged as EventListener);

    // Save comment count if it has changed
    async function updateCommentCount() {
      try {
        const previousCount = await getPreviousCommentCount(videoId);
        if (previousCount === null || previousCount !== totalComments) {
          // Comment count has changed or is being saved for the first time
          await saveVideoCommentCount(videoId, totalComments);
        }
        // Also save actual fetched comment count
        await saveActualCommentCount(videoId, allCommentIds.length);
      } catch (err) {
        console.error('Failed to save comment count:', err);
      }
    }
    updateCommentCount();

    // Use IntersectionObserver to detect when comments enter viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Only mark as viewed if user has interacted (scrolled/wheel/touch/keydown/click)
          // or if there's no scrollbar (handled by setTimeout check above)
          if (!userInteractedRef.current) return;

          if (entry.isIntersecting) {
            const commentId = entry.target.getAttribute('data-comment-id');

            // Helper to add and schedule save
            function addViewed(id: string | null) {
              if (!id) return;
              const sid = String(id);
              if (!viewedIdsRef.current.has(sid)) {
                viewedIdsRef.current.add(sid);
                // Throttle DB saves: only save every 2 seconds
                if (saveTimerRef.current) {
                  clearTimeout(saveTimerRef.current);
                }
                saveTimerRef.current = setTimeout(() => {
                  const viewedIds = Array.from(viewedIdsRef.current);
                  saveViewedCommentIds(videoId, viewedIds).catch(err => {
                    console.error('Failed to save viewed comment IDs:', err);
                  });
                  
                  // Calculate and save max viewed index
                  let maxIndex = -1;
                  for (const id of viewedIds) {
                    const idx = allCommentIds.indexOf(id);
                    if (idx > maxIndex) maxIndex = idx;
                  }
                  if (maxIndex >= 0) {
                    saveMaxViewedIndex(videoId, maxIndex).catch(err => {
                      console.error('Failed to save max viewed index:', err);
                    });
                  }
                }, 2000);
              }
            }

            // Mark the current visible comment as viewed
            addViewed(commentId);

            // Mark all comments BEFORE this one in DOM order as viewed
            try {
              const allCommentEls = Array.from(document.querySelectorAll('[data-comment-id]'));
              const currentIndex = allCommentEls.findIndex(el => el.getAttribute('data-comment-id') === commentId);
              
              if (currentIndex >= 0) {
                // Mark all comments from start to current as viewed
                for (let i = 0; i <= currentIndex; i++) {
                  const el = allCommentEls[i];
                  const id = el.getAttribute('data-comment-id');
                  if (id) addViewed(id);
                }
              }
            } catch (e) {
              // ignore DOM errors
            }
          }
        });
      },
      { 
        threshold: 1.0, // 100% visible to count as viewed
        rootMargin: '0px 0px -100px 0px' // Require comment to be 100px above bottom of viewport
      }
    );

    // Observe all comment elements
    const commentElements = document.querySelectorAll('[data-comment-id]');
    commentElements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
      // Remove interaction listeners
      window.removeEventListener('scroll', checkScrollForMovement as EventListener);
      window.removeEventListener('wheel', handleUserInteraction as EventListener);
      window.removeEventListener('touchstart', handleUserInteraction as EventListener);
      window.removeEventListener('keydown', handleUserInteraction as EventListener);
      window.removeEventListener('click', handleUserInteraction as EventListener);

      // Remove viewed-changed listener
      window.removeEventListener('viewed-comments-changed', onViewedChanged as EventListener);

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        // Save final state on unmount
        if (viewedIdsRef.current.size > 0) {
          const viewedIds = Array.from(viewedIdsRef.current);
          saveViewedCommentIds(videoId, viewedIds).catch(() => {});
          
          // Save max viewed index
          let maxIndex = -1;
          for (const id of viewedIds) {
            const idx = allCommentIds.indexOf(id);
            if (idx > maxIndex) maxIndex = idx;
          }
          if (maxIndex >= 0) {
            saveMaxViewedIndex(videoId, maxIndex).catch(() => {});
          }
        }
      }
    };
  }, [videoId, totalComments, allCommentIds]);

  return null;
}

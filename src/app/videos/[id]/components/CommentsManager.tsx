'use client';

import { useEffect, useState } from 'react';
import { getVideoComments, saveVideoComments } from '@/utils/indexeddb';

export default function CommentsManager({ 
  videoId, 
  serverComments, 
  onCommentsReady 
}: { 
  videoId: string; 
  serverComments: any[];
  onCommentsReady: (comments: any[], hasGaps: boolean) => void;
}) {
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return;

    async function mergeComments() {
      try {
        // Get cached comments from IndexedDB
        const cachedComments = await getVideoComments(videoId);
        
        let finalComments = [...serverComments];
        let hasGaps = false;

        if (cachedComments && cachedComments.length > 0) {
          // Merge: combine cached and new, remove duplicates by ID
          const commentMap = new Map();
          
          // Add cached comments first
          for (const comment of cachedComments) {
            commentMap.set(comment.id, comment);
          }
          
          // Override/add with server comments (newer data)
          for (const comment of serverComments) {
            commentMap.set(comment.id, comment);
          }
          
          finalComments = Array.from(commentMap.values());
          
          // Sort by publishedAt (oldest first)
          finalComments.sort((a, b) => {
            const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            return ta - tb;
          });
        }

        // Save merged comments for next time
        await saveVideoComments(videoId, finalComments);

        // Detect gaps: check if there are missing chronological numbers
        // We'll use timestamps to detect if there's a big time gap suggesting missing comments
        if (finalComments.length > 1) {
          const timestamps = finalComments.map(c => new Date(c.publishedAt).getTime());
          const avgGap = (timestamps[timestamps.length - 1] - timestamps[0]) / timestamps.length;
          
          for (let i = 1; i < timestamps.length; i++) {
            const gap = timestamps[i] - timestamps[i - 1];
            // If gap is more than 10x the average, assume missing comments
            if (gap > avgGap * 10 && avgGap > 0) {
              hasGaps = true;
              break;
            }
          }
        }

        setProcessed(true);
        onCommentsReady(finalComments, hasGaps);
      } catch (err) {
        console.error('Failed to merge comments:', err);
        // Fall back to server comments
        setProcessed(true);
        onCommentsReady(serverComments, false);
      }
    }

    mergeComments();
  }, [videoId, serverComments, processed, onCommentsReady]);

  return null;
}

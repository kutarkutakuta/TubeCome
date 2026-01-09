'use client';

import { useEffect, useState } from 'react';
import { getVideoComments, saveVideoComments } from '@/utils/indexeddb';

interface Comment {
  id: string;
  author: string;
  authorChannelId?: string;
  parentId?: string;
  text: string;
  publishedAt: string;
  likeCount?: number;
  dislikeCount?: number;
  isReply?: boolean;
  shortId?: string;
  isDeleted?: boolean;
}

export default function CommentMerger({
  videoId,
  serverComments,
  onMerged
}: {
  videoId: string;
  serverComments: Comment[];
  onMerged: (mergedComments: Comment[], gaps: Array<{ start: number; end: number }>) => void;
}) {
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return;

    async function mergeAndSave() {
      try {
        // Get cached comments from IndexedDB
        const cachedComments = await getVideoComments(videoId);
        
        let mergedComments: Comment[] = [];
        const commentMap = new Map<string, Comment>();

        // Add cached comments first
        if (cachedComments && cachedComments.length > 0) {
          for (const comment of cachedComments) {
            commentMap.set(comment.id, comment);
          }
        }

        // Override/add with server comments (newer data takes priority)
        for (const comment of serverComments) {
          commentMap.set(comment.id, comment);
        }

        mergedComments = Array.from(commentMap.values());

        // Sort by publishedAt (oldest first)
        mergedComments.sort((a, b) => {
          const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return ta - tb;
        });

        // Save merged comments
        await saveVideoComments(videoId, mergedComments);

        // Detect gaps by checking timestamp continuity
        const gaps: Array<{ start: number; end: number }> = [];
        if (mergedComments.length > 1) {
          const timestamps = mergedComments.map(c => new Date(c.publishedAt).getTime());
          const avgGap = (timestamps[timestamps.length - 1] - timestamps[0]) / (timestamps.length - 1);

          for (let i = 1; i < timestamps.length; i++) {
            const gap = timestamps[i] - timestamps[i - 1];
            // If gap is more than 10x the average, mark as potential missing comments
            if (gap > avgGap * 10 && avgGap > 0) {
              gaps.push({ start: i - 1, end: i });
            }
          }
        }

        setProcessed(true);
        onMerged(mergedComments, gaps);
      } catch (err) {
        console.error('Failed to merge comments:', err);
        // Fall back to server comments
        setProcessed(true);
        onMerged(serverComments, []);
      }
    }

    mergeAndSave();
  }, [videoId, serverComments, processed, onMerged]);

  return null;
}

"use client";
import { useEffect } from 'react';
import { markChannelVisited } from '@/utils/indexeddb';

export default function MarkChannelVisited({ channelId }: { channelId: string }) {
  useEffect(() => {
    markChannelVisited(channelId).catch(err => {
      console.error('Failed to mark channel as visited:', err);
    });
  }, [channelId]);

  return null;
}

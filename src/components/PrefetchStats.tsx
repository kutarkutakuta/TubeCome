"use client";
import { useEffect } from 'react';

export default function PrefetchStats({ ids }: { ids: string[] }) {
  useEffect(() => {
    if (!ids || ids.length === 0) return;
    let canceled = false;

    async function prefetch() {
      try {
        const chunk = ids.slice(0, 50).join(',');
        await fetch(`/api/video-stats?ids=${encodeURIComponent(chunk)}`);
      } catch (err) {
        console.warn('Prefetch stats failed', err);
      }
    }

    // run after paint
    const id = (globalThis as any).requestIdleCallback ? (globalThis as any).requestIdleCallback(prefetch) : setTimeout(prefetch, 1000);

    return () => {
      canceled = true;
      if ((globalThis as any).cancelIdleCallback) (globalThis as any).cancelIdleCallback(id);
      else clearTimeout(id as number);
    };
  }, [ids]);

  return null;
}

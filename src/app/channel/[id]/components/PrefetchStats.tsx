"use client";

import React, { useEffect } from 'react';

export default function PrefetchStats({ ids }: { ids: string[] }) {
  useEffect(() => {
    // fire-and-forget fetch - not critical
    if (!ids || ids.length === 0) return;
    const safeIds = ids.slice(0, 50).map(encodeURIComponent).join(',');
    fetch(`/api/video-stats?ids=${safeIds}`, { method: 'GET' }).catch(() => {});
  }, [ids]);

  return null;
}

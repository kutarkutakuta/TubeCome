"use client";

import React, { useEffect } from 'react';

export default function PrefetchStats({ ids }: { ids: string[] }) {
  useEffect(() => {
    // fire-and-forget fetch - not critical
    if (!ids || ids.length === 0) return;
    fetch('/api/video-stats', { method: 'POST', body: JSON.stringify({ ids }) }).catch(() => {});
  }, [ids]);

  return null;
}

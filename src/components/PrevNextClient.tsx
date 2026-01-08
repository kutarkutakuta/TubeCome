'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { decodeHtml } from '@/utils/html';

export default function PrevNextClient({ currentId }: { currentId: string }) {
  const [prev, setPrev] = useState<{ id?: string; title?: string } | null>(null);
  const [next, setNext] = useState<{ id?: string; title?: string } | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('tubecome:video-list');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const list: Array<{ id?: string; title?: string }> = parsed?.list || [];
      const idx = list.findIndex(x => x.id === currentId);
      if (idx >= 0) {
        setPrev(idx > 0 ? list[idx - 1] : null);
        setNext(idx + 1 < list.length ? list[idx + 1] : null);
      }
    } catch (e) {
      // ignore
    }
  }, [currentId]);

  if (!prev && !next) return null;

  return (
    <div className="mt-6 flex flex-col sm:flex-row justify-between text-sm gap-2">
      {prev ? (
        <Link href={`/videos/${prev.id}`} className="inline-flex items-center gap-2 max-w-full sm:max-w-[45%] text-sm font-bold text-[var(--fg-primary)]" title={prev.title} aria-label={`前の動画: ${prev.title}`}>
          <span className="text-lg mr-1"><LeftOutlined /></span>
          <span className="truncate">{decodeHtml(prev.title)}</span>
        </Link>
      ) : <div />}
      {next ? (
        <Link href={`/videos/${next.id}`} className="inline-flex items-center gap-2 max-w-full sm:max-w-[45%] text-sm font-bold text-[var(--fg-primary)] justify-end" title={next.title} aria-label={`次の動画: ${next.title}`}>
          <span className="truncate text-right">{decodeHtml(next.title)}</span>
          <span className="text-lg ml-1"><RightOutlined /></span>
        </Link>
      ) : <div />}
    </div>
  );
}

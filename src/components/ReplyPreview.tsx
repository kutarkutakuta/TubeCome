'use client';

import React from 'react';
import { Popover } from 'antd';

export default function ReplyPreview({ parentNum, snippet, authorName, publishedAt, shortId }: { parentNum?: number; snippet?: string; authorName?: string; publishedAt?: string; shortId?: string }) {
  if (!parentNum) return null;

  const formattedDate = publishedAt ? new Date(publishedAt).toLocaleString('ja-JP') : '';

  const content = (
    <div style={{ maxWidth: 420 }}>
      <div className="win-inset p-2">
        <div className="w-full flex items-center justify-between">
          <a href={`#post-${parentNum}`} className="text-sm text-[var(--fg-primary)] font-mono">{parentNum} : {authorName || '名無しさん'}</a>
          <div className="text-xs text-[var(--fg-secondary)]">{formattedDate}</div>
        </div>
        <div className="w-full text-xs text-[var(--fg-secondary)] mt-1 whitespace-pre-wrap">{snippet || '（親コメントがありません）'}</div>
      </div>
    </div>
  );

  return (
    <Popover content={content} trigger={["hover","click"]} placement="right">
      <a href={`#post-${parentNum}`} className="text-blue-600 underline block cursor-pointer">&gt;&gt;{parentNum}</a>
    </Popover>
  );
}

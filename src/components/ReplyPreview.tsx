'use client';

import React from 'react';
import { Popover } from 'antd';
import CommentAuthor from '@/components/CommentAuthor';
import { formatJaShortDateTime } from '@/utils/date';

export default function ReplyPreview({ parentNum, snippet, authorName, publishedAt, shortId, isOwner }: { parentNum?: number; snippet?: string; authorName?: string; publishedAt?: string; shortId?: string; isOwner?: boolean }) {
  if (!parentNum) return null;

  const formattedDate = publishedAt ? formatJaShortDateTime(publishedAt) : '';

  const content = (
    <div style={{ maxWidth: 420 }}>
      <div style={{ padding: '6px 8px' }}>
        <div className="w-full">
          <div className="mb-1 text-sm text-[var(--fg-secondary)] flex flex-wrap items-center">
            <a href={`#post-${parentNum}`} className="font-mono mr-1">{parentNum}</a> :
             <div className="ml-1 mr-1">
               <CommentAuthor authorName={authorName || '名無しさん'} isOwner={isOwner} shortId={shortId} />
             </div>
             : {formattedDate}
          </div>
        </div>
        <div className="w-full text-sm text-[var(--fg-secondary)] mt-1 whitespace-pre-wrap">{snippet || '（親コメントがありません）'}</div>
      </div>
    </div>
  );

  return (
    <Popover content={content} trigger={["hover","click"]} placement="right">
      <span className="text-blue-600 block cursor-pointer">&gt;&gt;{parentNum}</span>
    </Popover>
  );
}

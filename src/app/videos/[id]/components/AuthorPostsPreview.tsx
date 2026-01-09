'use client';

import React from 'react';
import { Popover, List } from 'antd';
import ReplyPreview from './ReplyPreview';
import CommentAuthor from '../../../../components/comment/CommentAuthor';
import { formatJaShortDateTime } from '@/utils/date';

type Item = { id: string; num: number; snippet?: string; authorName?: string; publishedAt?: string; shortId?: string; isOwner?: boolean; parentNum?: number; parentSnippet?: string; parentAuthor?: string; parentPublishedAt?: string; parentIsOwner?: boolean; parentShortId?: string };

export default function AuthorPostsPreview({ items, authorIndex, authorTotal, authorName, isOwner, shortId }: { items: Item[]; authorIndex: number; authorTotal: number; authorName: string; isOwner?: boolean; shortId?: string }) {
  if (!items || items.length === 0) return null;

  const content = (
    <div style={{ maxWidth: 420, maxHeight: 320, overflowY: 'auto' }}>
      <List
        size="small"
        dataSource={items}
        renderItem={(it: Item, index: number) => (
          <List.Item style={{ padding: '6px 8px', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div className="w-full">
              <div className="mb-1 text-sm text-[var(--fg-secondary)] flex flex-wrap items-center">
                <a href={`#post-${it.num}`} className="font-mono mr-1">{it.num}</a> :
                <div className="ml-1 mr-1">
                  {/* <CommentAuthor authorName={it.authorName || '名無しさん'} isOwner={it.isOwner} shortId={it.shortId}>
                     {it.authorName}
                     <span className="ml-1 text-xs text-[var(--fg-secondary)] font-normal">({index + 1}/{items.length})</span>
                  </CommentAuthor> */}
                </div>
                {it.publishedAt ? formatJaShortDateTime(it.publishedAt) : ''}
              </div>
            </div>
            {typeof it.parentNum === 'number' ? (
              <div className="mt-1">
                <ReplyPreview parentNum={it.parentNum} snippet={it.parentSnippet} authorName={it.parentAuthor} publishedAt={it.parentPublishedAt} isOwner={it.parentIsOwner} shortId={it.parentShortId} />
              </div>
            ) : null}
            <div className="w-full text-sm text-[var(--fg-secondary)] mt-1 whitespace-pre-wrap">{it.snippet}</div>
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Popover content={content} title={`${authorName} の投稿 (${authorIndex}/${authorTotal})`} trigger={['hover', 'click']} placement="right">
      <span className="text-sm text-[var(--fg-primary)] cursor-pointer text-blue-600">
        {authorName}
        {authorTotal > 1 ? <span className="ml-1 text-xs">({authorIndex}/{authorTotal})</span> : null}
      </span>
    </Popover>
  );
}

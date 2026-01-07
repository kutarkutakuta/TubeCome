'use client';

import React from 'react';
import { Popover, List } from 'antd';

type Item = { id: string; num: number; snippet?: string; authorName?: string; publishedAt?: string };

export default function AuthorPostsPreview({ items, authorIndex, authorTotal, authorName }: { items: Item[]; authorIndex: number; authorTotal: number; authorName: string }) {
  if (!items || items.length === 0) return null;

  const content = (
    <div style={{ maxWidth: 420 }}>
      <List
        size="small"
        dataSource={items}
        renderItem={(it: Item) => (
          <List.Item style={{ padding: '6px 8px', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div className="w-full flex items-center justify-between">
              <a href={`#post-${it.num}`} className="text-sm text-[var(--fg-primary)] font-mono">{it.num} : {it.authorName}</a>
              <div className="text-xs text-[var(--fg-secondary)]">{it.publishedAt ? new Date(it.publishedAt).toLocaleString('ja-JP') : ''}</div>
            </div>
            <div className="w-full text-xs text-[var(--fg-secondary)] mt-1">{it.snippet}</div>
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Popover content={content} title={`${authorName} の投稿 (${authorIndex}/${authorTotal})`} trigger={['hover', 'click']} placement="right">
      <a className="ml-1 text-sm text-[var(--fg-primary)] cursor-pointer">
        {authorName}
        {authorTotal > 1 ? <span className="ml-1 text-xs text-[var(--fg-secondary)]">({authorIndex}/{authorTotal})</span> : null}
      </a>
    </Popover>
  );
}

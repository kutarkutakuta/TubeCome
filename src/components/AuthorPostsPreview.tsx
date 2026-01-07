'use client';

import React from 'react';
import { Popover, List } from 'antd';

type Item = { id: string; num: number; snippet?: string };

export default function AuthorPostsPreview({ items, authorIndex, authorTotal }: { items: Item[]; authorIndex: number; authorTotal: number }) {
  if (!items || items.length === 0) return null;

  const content = (
    <div style={{ maxWidth: 320 }}>
      <List
        size="small"
        dataSource={items}
        renderItem={(it: Item) => (
          <List.Item style={{ padding: '6px 8px' }}>
            <a href={`#post-${it.num}`} className="text-sm text-[var(--fg-primary)]">&gt;&gt;{it.num}</a>
            <div className="text-xs text-[var(--fg-secondary)] ml-2 truncate">{it.snippet}</div>
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Popover content={content} title={`${authorIndex}/${authorTotal} の投稿`} trigger={['hover', 'click']} placement="right">
      <a className="ml-2 text-xs text-[var(--fg-secondary)] cursor-pointer">({authorIndex}/{authorTotal})</a>
    </Popover>
  );
}

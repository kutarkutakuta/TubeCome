'use client';

import React from 'react';
import { Tag, Tooltip } from 'antd';
import { EyeOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons';

export default function VideoStatsClient({ statistics }: { statistics?: { viewCount?: number; likeCount?: number; commentCount?: number } }) {
  if (!statistics) return null;

  const views = statistics.viewCount ?? null;
  const likes = statistics.likeCount ?? null;
  const comments = statistics.commentCount ?? null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {typeof views === 'number' && (
        <Tooltip title="再生数">
          <Tag variant="outlined" icon={<EyeOutlined />} color="gold">{views.toLocaleString()}</Tag>
        </Tooltip>
      )}
      {typeof likes === 'number' && (
        <Tooltip title="高評価">
          <Tag variant="outlined" icon={<LikeOutlined />} color="success">{likes.toLocaleString()}</Tag>
        </Tooltip>
      )}
      {typeof comments === 'number' && (
        <Tooltip title="コメント数">
          <Tag variant="outlined" icon={<MessageOutlined />} color="default">{comments.toLocaleString()}</Tag>
        </Tooltip>
      )}
    </div>
  );
}

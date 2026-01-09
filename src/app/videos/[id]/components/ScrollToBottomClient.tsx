'use client';

import React, { useEffect, useState } from 'react';
import { FloatButton } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { saveViewedCommentIds } from '@/utils/indexeddb';

export default function ScrollToBottomClient({ videoId, allCommentIds }: { videoId: string; allCommentIds: string[] }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function check() {
      const atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 200);
      setVisible(!atBottom);
    }
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  async function scrollToBottom() {
    // Mark all comments as viewed
    if (allCommentIds.length > 0) {
      try {
        await saveViewedCommentIds(videoId, allCommentIds);
      } catch (err) {
        console.error('Failed to save viewed comment IDs:', err);
      }
    }

    // Then scroll to bottom
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  }

  return (
    <FloatButton
      type="default"
      icon={<DownOutlined />}
      onClick={scrollToBottom}
      style={{ right: 30, bottom: 104, display: visible ? 'inline-flex' : 'none', zIndex: 1000 }}
    />
  );
}

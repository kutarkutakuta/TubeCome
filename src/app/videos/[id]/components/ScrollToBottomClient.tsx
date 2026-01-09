'use client';

import React, { useEffect, useState } from 'react';
import { FloatButton } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { saveViewedCommentNumber } from '@/utils/indexeddb';

export default function ScrollToBottomClient({ videoId }: { videoId: string }) {
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
    // Find the highest comment number before scrolling
    const commentElements = document.querySelectorAll('[data-comment-num]');
    let maxCommentNum = 0;
    commentElements.forEach(el => {
      const num = parseInt(el.getAttribute('data-comment-num') || '0', 10);
      if (num > maxCommentNum) {
        maxCommentNum = num;
      }
    });

    // Mark all comments as viewed
    if (maxCommentNum > 0) {
      try {
        await saveViewedCommentNumber(videoId, maxCommentNum);
      } catch (err) {
        console.error('Failed to save viewed comment number:', err);
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

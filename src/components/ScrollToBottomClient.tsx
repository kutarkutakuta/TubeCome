'use client';

import React, { useEffect, useState } from 'react';
import { FloatButton } from 'antd';
import { DownOutlined } from '@ant-design/icons';

export default function ScrollToBottomClient() {
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

  function scrollToBottom() {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  }

  return (
    <FloatButton
      type="primary"
      icon={<DownOutlined />}
      onClick={scrollToBottom}
      style={{ right: 24, bottom: 24, display: visible ? 'inline-flex' : 'none' }}
      tooltip="末尾へ"
    />
  );
}

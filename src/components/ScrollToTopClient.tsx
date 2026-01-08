'use client';

import React, { useEffect, useState } from 'react';
import { FloatButton } from 'antd';
import { UpOutlined } from '@ant-design/icons';

export default function ScrollToTopClient() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function check() {
      setVisible(window.scrollY > 200);
    }
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <FloatButton
      type="default"
      icon={<UpOutlined />}
      onClick={scrollToTop}
      style={{ right: 48, bottom: 152, display: visible ? 'inline-flex' : 'none', zIndex: 1000 }}
      tooltip="トップへ"
    />
  );
}

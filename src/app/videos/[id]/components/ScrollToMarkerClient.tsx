'use client';

import React, { useEffect, useState } from 'react';
import { FloatButton } from 'antd';
import { AimOutlined, BookOutlined, EnvironmentOutlined, EyeOutlined, HighlightOutlined, LineOutlined, VerticalAlignMiddleOutlined } from '@ant-design/icons';

export default function ScrollToMarkerClient() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function check() {
      const marker = document.getElementById('last-viewed-marker');
      setVisible(!!marker);
    }
    // Check initially and periodically
    const timer = setTimeout(check, 500);
    const interval = setInterval(check, 2000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  function scrollToMarker() {
    const marker = document.getElementById('last-viewed-marker');
    if (marker) {
      marker.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return (
    <FloatButton
      type="default"
      icon={<BookOutlined />}
      onClick={scrollToMarker}
      style={{ right: 30, bottom: 200, display: visible ? 'inline-flex' : 'none', zIndex: 1000 }}
    />
  );
}

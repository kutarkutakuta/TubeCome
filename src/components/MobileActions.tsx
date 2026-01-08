'use client';

import React from 'react';
import { FloatButton } from 'antd';
import { PlusOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

export default function MobileActions() {
  const router = useRouter();

  return (
    <>
      <FloatButton.Group shape="circle" style={{ right: 24, bottom: 84 }}>
        <FloatButton icon={<AppstoreOutlined />} onClick={() => router.push('/channels')} />
        <FloatButton icon={<PlusOutlined />} type="primary" onClick={() => router.push('/channels')} />
      </FloatButton.Group>
    </>
  );
}

'use client';

import React, { useState } from 'react';
import { FloatButton, Drawer } from 'antd';
import { PlusOutlined, StarOutlined } from '@ant-design/icons';
import AddChannelForm from './AddChannelForm';
import FavoritesList from './FavoritesList';

export default function MobileActions() {
  const [showAdd, setShowAdd] = useState(false);
  const [showFav, setShowFav] = useState(false);

  return (
    <>
      <FloatButton.Group shape="circle" style={{ right: 24, bottom: 84 }}>
        <FloatButton icon={<StarOutlined />} onClick={() => setShowFav(true)} />
        <FloatButton icon={<PlusOutlined />} type="primary" onClick={() => setShowAdd(true)} />
      </FloatButton.Group>

      <Drawer
        title="チャンネル登録"
        placement="bottom"
        onClose={() => setShowAdd(false)}
        open={showAdd}
        height="auto"
      >
        <AddChannelForm />
      </Drawer>

      <Drawer
        title="お気に入りチャンネル"
        placement="bottom"
        onClose={() => setShowFav(false)}
        open={showFav}
        height="60vh"
      >
        <FavoritesList />
      </Drawer>
    </>
  );
}

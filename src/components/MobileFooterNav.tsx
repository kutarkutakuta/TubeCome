'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Drawer } from 'antd';
import { LeftOutlined, PlusOutlined, StarOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import AddChannelForm from './AddChannelForm';
import FavoritesList from './FavoritesList';

export default function MobileFooterNav() {
  const [showAdd, setShowAdd] = useState(false);
  const [showFav, setShowFav] = useState(false);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 mobile-nav-container grid grid-cols-4 z-50 px-1 pb-1">
        <button
          className="flex flex-col items-center justify-center active:bg-gray-300 rounded-sm m-0.5"
          onClick={() => window.history.back()}
          aria-label="戻る"
        >
          <div className="win-btn p-1 flex flex-col items-center w-full h-full justify-center">
            <LeftOutlined className="text-lg leading-none mb-0.5" />
            <span className="text-[10px] font-bold">戻る</span>
          </div>
        </button>

        <Link
          href="/help"
          className="flex flex-col items-center justify-center active:bg-gray-300 rounded-sm m-0.5"
        >
          <div className="win-btn p-1 flex flex-col items-center w-full h-full justify-center">
            <QuestionCircleOutlined className="text-lg leading-none mb-0.5" />
            <span className="text-[10px] font-bold">ヘルプ</span>
          </div>
        </Link>

        <button
          className="flex flex-col items-center justify-center active:bg-gray-300 rounded-sm m-0.5"
          onClick={() => setShowFav(true)}
          aria-label="お気に入り"
        >
          <div className="win-btn p-1 flex flex-col items-center w-full h-full justify-center">
            <StarOutlined className="text-lg leading-none mb-0.5" />
            <span className="text-[10px] font-bold">お気に入り</span>
          </div>
        </button>

        <button
          className="flex flex-col items-center justify-center active:bg-gray-300 rounded-sm m-0.5"
          onClick={() => setShowAdd(true)}
          aria-label="チャンネル追加"
        >
          <div className="win-btn p-1 flex flex-col items-center w-full h-full justify-center">
            <PlusOutlined className="text-lg leading-none mb-0.5" />
            <span className="text-[10px] font-bold">登録</span>
          </div>
        </button>
      </nav>

      <Drawer
        title="チャンネル登録"
        placement="bottom"
        onClose={() => setShowAdd(false)}
        open={showAdd}
      >
        <AddChannelForm />
      </Drawer>

      <Drawer
        title="お気に入りチャンネル"
        placement="bottom"
        onClose={() => setShowFav(false)}
        open={showFav}
      >
        <FavoritesList />
      </Drawer>
    </>
  );
}

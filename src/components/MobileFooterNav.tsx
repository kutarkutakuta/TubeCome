'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LeftOutlined, PlusOutlined, AppstoreOutlined, QuestionCircleOutlined, StarOutlined } from '@ant-design/icons';
import { Drawer } from 'antd';
import FavoritesList from './FavoritesList';

export default function MobileFooterNav() {
  const [favOpen, setFavOpen] = useState(false);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 mobile-nav-container grid grid-cols-3 z-50 px-2 pb-1">
        <Link
          href="/channels"
          className="flex flex-col items-center justify-center active:bg-gray-300 rounded-sm m-0.5"
        >
          <div className="win-btn p-1 flex flex-col items-center w-full h-full justify-center">
            <AppstoreOutlined className="text-lg leading-none mb-0.5" />
            <span className="text-[10px] font-bold">チャンネル</span>
          </div>
        </Link>

        <button
          type="button"
          className="flex flex-col items-center justify-center active:bg-gray-300 rounded-sm m-0.5"
          onClick={() => setFavOpen(true)}
          aria-label="お気に入りを開く"
        >
          <div className="win-btn p-1 flex flex-col items-center w-full h-full justify-center">
            <StarOutlined className="text-lg leading-none mb-0.5" />
            <span className="text-[10px] font-bold">お気に入り</span>
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
      </nav>

      <Drawer title="お気に入りチャンネル" placement="bottom" onClose={() => setFavOpen(false)} open={favOpen}>
        <FavoritesList onSelect={() => setFavOpen(false)} />
      </Drawer>
    </>
  );
}

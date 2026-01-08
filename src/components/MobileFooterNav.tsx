'use client';

import React from 'react';
import Link from 'next/link';
import { LeftOutlined, PlusOutlined, AppstoreOutlined, QuestionCircleOutlined } from '@ant-design/icons';

export default function MobileFooterNav() {
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

        <Link
          href="/channels"
          className="flex flex-col items-center justify-center active:bg-gray-300 rounded-sm m-0.5"
        >
          <div className="win-btn p-1 flex flex-col items-center w-full h-full justify-center">
            <AppstoreOutlined className="text-lg leading-none mb-0.5" />
            <span className="text-[10px] font-bold">チャンネル</span>
          </div>
        </Link>

        <Link
          href="/channels"
          className="flex flex-col items-center justify-center active:bg-gray-300 rounded-sm m-0.5"
        >
          <div className="win-btn p-1 flex flex-col items-center w-full h-full justify-center">
            <PlusOutlined className="text-lg leading-none mb-0.5" />
            <span className="text-[10px] font-bold">登録</span>
          </div>
        </Link>
      </nav>

    </>
  );
}

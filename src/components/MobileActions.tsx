'use client';

import React, { useState } from 'react';
import AddChannelForm from './AddChannelForm';
import FavoritesList from './FavoritesList';

export default function MobileActions() {
  const [showAdd, setShowAdd] = useState(false);
  const [showFav, setShowFav] = useState(false);

  return (
    <>
      <div className="md:hidden fixed bottom-20 right-3 z-50 flex flex-col gap-2">
        <button
          aria-label="チャンネル登録を開く"
          onClick={() => setShowAdd(true)}
          className="win-btn w-12 h-12 flex items-center justify-center"
        >
          ＋
        </button>
        <button
          aria-label="お気に入りを開く"
          onClick={() => setShowFav(true)}
          className="win-btn w-12 h-12 flex items-center justify-center"
        >
          ★
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdd(false)} />
          <div className="w-full p-4">
            <div className="win-window win-inset p-2">
              <div className="win-title-bar flex justify-between">
                <span>チャンネル登録</span>
                <button className="win-btn w-6 h-6" onClick={() => setShowAdd(false)}>×</button>
              </div>
              <div className="p-2">
                <AddChannelForm />
              </div>
            </div>
          </div>
        </div>
      )}

      {showFav && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFav(false)} />
          <div className="w-full p-4">
            <div className="win-window win-inset p-2">
              <div className="win-title-bar flex justify-between">
                <span>お気に入りチャンネル</span>
                <button className="win-btn w-6 h-6" onClick={() => setShowFav(false)}>×</button>
              </div>
              <div className="p-2">
                <FavoritesList />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

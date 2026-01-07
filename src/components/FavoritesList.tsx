'use client';

import { useEffect, useState } from 'react';
import { getFavorites, removeFavorite } from '../utils/favorites';
import Link from 'next/link';

export default function FavoritesList() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
    function onChange() {
      setFavorites(getFavorites());
    }
    window.addEventListener('favorites-changed', onChange);
    return () => window.removeEventListener('favorites-changed', onChange);
  }, []);

  if (favorites.length === 0) {
    return (
      <div className="mt-4 win-window">
        <div className="win-title-bar">お気に入りチャンネル</div>
        <div className="p-2 win-inset text-xs text-[var(--fg-secondary)]">お気に入りに登録したチャンネルがここに表示されます。</div>
      </div>
    );
  }

  return (
    <div className="mt-4 win-window">
      <div className="win-title-bar">お気に入りチャンネル</div>
      <div className="p-2 win-inset text-sm">
        <ul className="space-y-2">
          {favorites.map((ch) => (
            <li key={ch} className="flex items-center justify-between">
              <Link href={`/search?channel=${encodeURIComponent(ch)}`} className="text-[var(--fg-primary)]">
                {ch}
              </Link>
              <button
                className="win-btn text-xs"
                onClick={() => {
                  removeFavorite(ch);
                  setFavorites(getFavorites());
                }}
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

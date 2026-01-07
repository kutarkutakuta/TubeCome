'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { getAllFavorites, removeFavorite as idbRemoveFavorite } from '@/utils/indexeddb';

async function fetchFavorites() {
  try {
    const arr = await getAllFavorites();
    return arr.map((f:any)=>({ id: f.id, title: f.title }));
  } catch (e) {
    try {
      const raw = localStorage.getItem('tubecome-favorites');
      return raw ? JSON.parse(raw) : [];
    } catch (err) { return []; }
  }
}

export default function FavoritesList() {
  const [favorites, setFavorites] = useState<Array<{id:string,title?:string}>>([]);

  useEffect(() => {
    let mounted = true;
    fetchFavorites().then(data => { if (mounted) setFavorites(data); });
    function onChange() {
      fetchFavorites().then(data => setFavorites(data));
    }
    window.addEventListener('favorites-changed', onChange);
    return () => { mounted = false; window.removeEventListener('favorites-changed', onChange); };
  }, []);

  if (!favorites || favorites.length === 0) {
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
            <li key={ch.id} className="flex items-center justify-between">
              <Link href={`/search?channel=${encodeURIComponent(ch.id)}`} className="text-[var(--fg-primary)]">
                {ch.title || ch.id}
              </Link>
              <button
                className="win-btn text-xs"
                onClick={async () => {
                  try {
                    await idbRemoveFavorite(ch.id);
                  } catch (e) {
                    // ignore
                  }
                  const data = await fetchFavorites();
                  setFavorites(data);
                  window.dispatchEvent(new CustomEvent('favorites-changed'));
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

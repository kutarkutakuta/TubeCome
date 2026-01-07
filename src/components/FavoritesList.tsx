'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { List, Button, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let mountedFlag = true;
    setMounted(true);

    async function refreshFavorites() {
      const data = await fetchFavorites();
      // Resolve missing titles for UC ids
      const toResolve = data.filter((d:any) => (!d.title || d.title === d.id) && /^UC[0-9A-Za-z_-]{20,}$/.test(d.id));
      if (toResolve.length > 0) {
        for (const item of toResolve) {
          try {
            const res = await fetch('/api/resolve-channel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: item.id }) });
            if (res.ok) {
              const json = await res.json();
              const title = json.channelTitle;
              if (title) {
                // update IndexedDB
                await import('@/utils/indexeddb').then(m => m.addFavorite(item.id, title));
              }
            }
          } catch (e) {
            // ignore resolution errors
          }
        }
      }
      const refreshed = await fetchFavorites();
      if (mountedFlag) setFavorites(refreshed);
    }
    // initial load
    refreshFavorites();

    function onChange() {
      // refresh and resolve missing titles when favorites change
      refreshFavorites();
    }
    window.addEventListener('favorites-changed', onChange);
    return () => { mountedFlag = false; window.removeEventListener('favorites-changed', onChange); };
  }, []);

  if (!mounted) return null;

  return (
    <List
      dataSource={favorites}
      renderItem={(ch) => (
        <List.Item
          actions={[
             <Popconfirm 
                key="del"
                title="削除しますか？" 
                onConfirm={async () => {
                  try {
                    await idbRemoveFavorite(ch.id);
                  } catch (e) {
                    // ignore
                  }
                  const data = await fetchFavorites();
                  setFavorites(data);
                }}
             >
               <Button type="text" danger icon={<DeleteOutlined />} size="small"></Button>
             </Popconfirm>
          ]}
        >
          <List.Item.Meta
            title={<Link href={`/channel/${encodeURIComponent(ch.id)}`}>{ch.title || ch.id}</Link>}
          />
        </List.Item>
      )}
      locale={{ emptyText: 'お気に入りに登録したチャンネルがここに表示されます。' }}
    />
  );
}

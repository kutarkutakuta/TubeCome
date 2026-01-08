'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { List, Button } from 'antd';
import { StarFilled } from '@ant-design/icons';
import { getAllChannels } from '@/utils/indexeddb';
import { getFavorites, removeFavorite } from '@/utils/favorites';

async function fetchChannels() {
  try {
    const arr = await getAllChannels();
    return arr.map((f:any)=>({ id: f.id, title: f.title }));
  } catch (e) {
    return [];
  }
}

export default function ChannelsList() {
  const [favoriteChannels, setFavoriteChannels] = useState<Array<{id:string,title?:string}>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let mountedFlag = true;
    setMounted(true);

    async function refresh() {
      const channels = await fetchChannels();
      const favs = getFavorites();

      // Order favorites according to channels order. If a favorite is not in channels list, append it at the end.
      const favSet = new Set(favs);
      const ordered = channels.filter((c:any) => favSet.has(c.id)).map((c:any) => ({ id: c.id, title: c.title }));
      const missing = favs.filter((id) => !channels.some((c:any) => c.id === id)).map((id) => ({ id, title: id }));
      const list = [...ordered, ...missing];

      // Try to resolve missing titles for UC ids
      const toResolve = list.filter((d:any) => (!d.title || d.title === d.id) && /^UC[0-9A-Za-z_-]{20,}$/.test(d.id));
      if (toResolve.length > 0) {
        for (const item of toResolve) {
          try {
            const res = await fetch('/api/resolve-channel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: item.id }) });
            if (res.ok) {
              const json = await res.json();
              const title = json.channelTitle;
              if (title) {
                // update IndexedDB so next time it shows title from channels store
                await import('@/utils/indexeddb').then(m => m.addChannel(item.id, title));
                item.title = title;
              }
            }
          } catch (e) {
            // ignore resolution errors
          }
        }
      }

      if (mountedFlag) setFavoriteChannels(list);
    }

    // initial load
    refresh();

    function onChange() {
      refresh();
    }
    window.addEventListener('channels-changed', onChange);
    window.addEventListener('favorites-changed', onChange);
    return () => { mountedFlag = false; window.removeEventListener('channels-changed', onChange); window.removeEventListener('favorites-changed', onChange); };
  }, []);

  if (!mounted) return null;

  return (
    <div className="max-h-[60vh] overflow-y-auto">
      <List
        dataSource={favoriteChannels}
        renderItem={(ch) => (
          <List.Item>
            <div className="flex items-center w-full">
              <Button
                key="fav"
                size="small"
                type="text"
                className="mr-2 p-0"
                aria-label="お気に入り解除"
                icon={<StarFilled style={{ color: '#faad14', fontSize: 16 }} />}
                onClick={() => { removeFavorite(ch.id); setFavoriteChannels((s) => s.filter((x) => x.id !== ch.id)); }}
              />

              <div className="flex-1">
                <Link href={`/channel/${encodeURIComponent(ch.id)}`}>{ch.title || ch.id}</Link>
              </div>
            </div>
          </List.Item>
        )}
        locale={{ emptyText: 'お気に入りに登録したチャンネルがここに表示されます。' }}
      />
    </div>
  );
}

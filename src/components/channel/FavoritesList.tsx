'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { List, Button, Badge } from 'antd';
import { StarFilled } from '@ant-design/icons';
import { getAllChannels } from '@/utils/indexeddb';
import { getFavorites, removeFavorite } from '@/utils/favorites';
import { countNewVideos } from '@/utils/rss';

async function fetchChannels() {
  try {
    const arr = await getAllChannels();
    return arr.map((f:any)=>({ id: f.id, title: f.title, thumbnail: f.thumbnail, lastVisited: f.lastVisited }));
  } catch (e) {
    return [];
  }
}

export default function ChannelsList({ onSelect }: { onSelect?: () => void }) {
  const [favoriteChannels, setFavoriteChannels] = useState<Array<{id:string,title?:string,lastVisited?:number}>>([]);
  const [mounted, setMounted] = useState(false);
  const [newCounts, setNewCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let mountedFlag = true;
    setMounted(true);

    async function refresh() {
      const channels = await fetchChannels();
      const favs = getFavorites();

      // Order favorites according to channels order. If a favorite is not in channels list, append it at the end.
      const favSet = new Set(favs);
      const ordered = channels.filter((c:any) => favSet.has(c.id)).map((c:any) => ({ id: c.id, title: c.title, lastVisited: c.lastVisited }));
      const missing = favs.filter((id) => !channels.some((c:any) => c.id === id)).map((id) => ({ id, title: id }));
      const list = [...ordered, ...missing];

      if (mountedFlag) {
        setFavoriteChannels(list);
        // Fetch new counts
        fetchNewCounts(list);
      }
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

  // Fetch new video counts in the background
  async function fetchNewCounts(channelList: Array<any>) {
    const counts: Record<string, number> = {};
    for (const ch of channelList) {
      const count = await countNewVideos(ch.id, ch.lastVisited);
      if (count > 0) counts[ch.id] = count;
    }
    setNewCounts(counts);
  }

  if (!mounted) return null;

  return (
    <div className="w-full">
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

              <div className="flex-1 min-w-0 flex items-center gap-2">
                <Link href={`/channel/${encodeURIComponent(ch.id)}`} onClick={() => onSelect?.()} className="truncate flex-1">{ch.title || ch.id}</Link>
                {newCounts[ch.id] > 0 && (
                  <Badge count={newCounts[ch.id]} showZero={false} color="#ff85c1" />
                )}
              </div>
            </div>
          </List.Item>
        )}
        locale={{ emptyText: 'お気に入りに登録したチャンネルがここに表示されます。' }}
      />
    </div>
  );
}

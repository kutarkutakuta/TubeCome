'use client';

import React, { useEffect, useState } from 'react';
import { List, Button, Popconfirm, message, Badge } from 'antd';
import { StarOutlined, StarFilled, DeleteOutlined, MenuOutlined, ReloadOutlined } from '@ant-design/icons';
import Link from 'next/link';
import AddChannelForm from './AddChannelForm';
import { getAllChannels, removeChannel as idbRemoveChannel, addChannel as idbAddChannel, resetAllLastVisitedForTest } from '@/utils/indexeddb';
import { getFavorites, addFavorite, removeFavorite } from '@/utils/favorites';
import { countNewVideos } from '@/utils/rss';

export default function ChannelsHome() {
  const [channels, setChannels] = useState<Array<{id:string,title?:string,lastVisited?:number}>>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [newCounts, setNewCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let mounted = true;
    async function load() {
      const ch = await getAllChannels();
      if (mounted) setChannels(ch.map((c:any)=>({ id: c.id, title: c.title, thumbnail: c.thumbnail, lastVisited: c.lastVisited })));
      await resolveMissingTitles(ch);
      // Fetch new video counts for each channel
      fetchNewCounts(ch);
    }
    load();
    async function resolveMissingTitles(channels: Array<any>) {
      const toResolve = channels.filter((d:any) => (!d.title || d.title === d.id) && /^UC[0-9A-Za-z_-]{20,}$/.test(d.id));
      if (toResolve.length === 0) return;
      for (const item of toResolve) {
        try {
          const res = await fetch('/api/resolve-channel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: item.id }) });
          if (res.ok) {
            const json = await res.json();
            const title = json.channelTitle;
            if (title) {
              await idbAddChannel(item.id, title);
            }
          }
        } catch (e) {
          // ignore
        }
      }
      // reload after resolution
      await load();
    }

    function onChannels() { load(); }
    function onFavs() { if (mounted) setFavorites(getFavorites()); }
    window.addEventListener('channels-changed', onChannels);
    window.addEventListener('favorites-changed', onFavs);
    // initial favs
    setFavorites(getFavorites());
    return () => { mounted = false; window.removeEventListener('channels-changed', onChannels); window.removeEventListener('favorites-changed', onFavs); };
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

  // drag handlers
  function onDragStart(e: React.DragEvent, id: string) {
    setDraggingId(id);
    try { e.dataTransfer.setData('text/plain', id); } catch (e) {}
  }

  function onDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setDragOverId(id);
  }

  async function onDrop(e: React.DragEvent, id: string) {
    e.preventDefault();
    const draggedId = draggingId || e.dataTransfer.getData('text/plain');
    if (!draggedId) return;
    if (draggedId === id) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }

    const items = [...channels];
    const fromIdx = items.findIndex((c) => c.id === draggedId);
    const toIdx = items.findIndex((c) => c.id === id);
    if (fromIdx === -1 || toIdx === -1) return;

    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    setChannels(items);

    // persist order
    await import('@/utils/indexeddb').then(m => m.setChannelsOrder(items.map((c)=>c.id)));

    setDraggingId(null);
    setDragOverId(null);
  }
  async function removeChannel(id: string) {
    try {
      await idbRemoveChannel(id);
      // Also remove from favorites to avoid auto re-adding from favorites resolver
      try { removeFavorite(id); } catch (e) { /* ignore */ }
      message.success('登録を削除しました');
    } catch (e) {
      message.error('削除に失敗しました');
    }

    const ch = await getAllChannels();
    setChannels(ch.map((c:any)=>({ id: c.id, title: c.title, thumbnail: c.thumbnail, lastVisited: c.lastVisited })));
  }

  function toggleFav(id: string) {
    if (favorites.includes(id)) removeFavorite(id);
    else addFavorite(id);
    setFavorites(getFavorites());
  }

  async function handleTestReset() {
    await resetAllLastVisitedForTest();
    message.success('全チャンネルの訪問日時を7日前にリセットしました。ページを更新してください。');
    // Reload to fetch new counts
    window.location.reload();
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
           <div className="win-inset bg-white p-2 mb-4">
        <h1 className="text-2xl italic font-black text-slate-800 tracking-tighter">
          <span className="text-blue-700">Tube</span>Come
          <span className="text-red-500 text-xs ml-1">2000</span>
        </h1>
      </div>

      <div className="win-window win-title-bar mb-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">チャンネル</div>
          <Button 
            size="small" 
            icon={<ReloadOutlined />} 
            onClick={handleTestReset}
            type="dashed"
          >
            テスト: 新着リセット
          </Button>
        </div>
      </div>

      <div className="win-window win-inset p-4">
        <div className="mb-4"><AddChannelForm /></div>
        {channels.length > 0 && (
          <div className="mb-2 text-xs text-gray-500">ドラッグして順番を並べ替えられます（ハンドルを掴んで移動）
          </div>
        )}
        <List
          dataSource={channels}
          renderItem={(ch, idx) => (
            <List.Item
              onDragOver={(e) => onDragOver(e, ch.id)}
              onDrop={(e) => onDrop(e, ch.id)}
              style={{ opacity: draggingId === ch.id ? 0.5 : 1, background: dragOverId === ch.id ? 'rgba(0,0,0,0.03)' : undefined }}
            >
              <div className="flex items-center w-full">
                <div
                  className="drag-handle mr-2 p-1 text-gray-500 hover:text-gray-700"
                  draggable
                  onDragStart={(e) => onDragStart(e, ch.id)}
                  onDragEnd={() => { setDraggingId(null); setDragOverId(null); }}
                  title="ここを掴んでドラッグ"
                  style={{ cursor: 'grab' }}
                >
                  <MenuOutlined style={{ fontSize: 16 }} />
                </div>

                <Button
                  key="fav"
                  size="small"
                  type="text"
                  className="mr-2 p-0"
                  aria-label={favorites.includes(ch.id) ? 'お気に入り解除' : 'お気に入りに追加'}
                  icon={favorites.includes(ch.id) ? <StarFilled style={{ color: '#faad14', fontSize: 16 }} /> : <StarOutlined style={{ fontSize: 16 }} />}
                  onClick={() => { toggleFav(ch.id); }}
                />

                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <Link href={`/channel/${encodeURIComponent(ch.id)}`} className="flex-1 whitespace-normal break-words">{ch.title || ch.id}</Link>
                  {newCounts[ch.id] > 0 && (
                    <Badge count={newCounts[ch.id]} showZero={false} color="#ff85c1" />
                  )}
                </div>

                <div className="ml-2">
                  <Popconfirm
                    key="del"
                    title="登録を削除しますか？"
                    onConfirm={async () => { await removeChannel(ch.id); }}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} size="small"></Button>
                  </Popconfirm>
                </div>
              </div>
            </List.Item>
          )}
          locale={{ emptyText: 'チャンネルはまだ登録されていません。' }}
        />
      </div>

      <div className="h-20" />
    </div>
  );
}

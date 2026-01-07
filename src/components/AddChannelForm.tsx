'use client';

import React, { useState } from 'react';
import { addFavorite as idbAddFavorite } from '@/utils/indexeddb';

export default function AddChannelForm() {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'ok'|'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/resolve-channel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input }) });
      const json = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(json?.error || 'resolve_failed');
        return;
      }
      const channelId = json.channelId;
      const channelTitle = json.channelTitle || channelId;
      if (!channelId) {
        setStatus('error');
        setMessage('channel_not_found');
        return;
      }
      await idbAddFavorite(channelId, channelTitle);
      setStatus('ok');
      setMessage(`登録しました: ${channelTitle}`);
      setInput('');
      window.dispatchEvent(new CustomEvent('favorites-changed'));
    } catch (err) {
      setStatus('error');
      setMessage(String(err));
    }
  }

  return (
    <form onSubmit={onSubmit} className="win-window">
      <label className="win-title-bar">チャンネル URL / ID を登録</label>
      <div className="flex gap-2 p-2">
        <input
          className="flex-1 p-1 border border-gray-300 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="チャンネルURLかチャンネルIDを貼ってください (例: UC...)"
        />
        <button className="win-btn text-sm" type="submit" disabled={status==='loading'}>{status==='loading' ? '...' : '追加'}</button>
      </div>
      <div className="mt-2 text-xs text-[var(--fg-secondary)]">
        {status==='ok' && <span className="text-green-600">登録しました。</span>}
        {status==='error' && <span className="text-red-600">エラー: {message}</span>}
      </div>
    </form>
  );
}

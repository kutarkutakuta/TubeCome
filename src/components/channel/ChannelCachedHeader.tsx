'use client';
import React, { useEffect, useState } from 'react';
import ZoomableThumbnail from '@/components/video/ZoomableThumbnail';
import { getChannel } from '@/utils/indexeddb';

type Props = {
  channelId: string;
  message?: string;
};

export default function ChannelCachedHeader({ channelId, message }: Props) {
  const [channel, setChannel] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const c = await getChannel(channelId);
        if (mounted) setChannel(c);
      } catch {
        // ignore
      }
    };
    load();
    const onChange = () => load();
    window.addEventListener('channels-changed', onChange);
    return () => {
      mounted = false;
      window.removeEventListener('channels-changed', onChange);
    };
  }, [channelId]);

  if (!channel) {
    return (
      <div className="win-window win-title-bar mb-4">
        <div className="text-lg font-bold">チャンネル</div>
        <div className="text-sm text-[var(--fg-secondary)] mt-2">{message ?? 'キャッシュされたチャンネル情報はありません。'}</div>
      </div>
    );
  }

  return (
    <div className="win-window win-title-bar mb-4">
      <div className="w-full flex items-center gap-3">
        <div className="w-16 h-16">
          <ZoomableThumbnail
            containerClassName="h-16 w-16 rounded-sm overflow-hidden bg-[var(--bg-panel)]"
            src={channel.thumbnail ?? undefined}
            alt={channel.title ?? channel.id}
            width={160}
            height={90}
          />
        </div>
        <div className="flex-1">
          <div className="text-lg font-bold">{channel.title ?? channel.id}</div>
          <div className="text-xs text-[var(--fg-secondary)]">チャンネルID: {channel.id}</div>
          <div className="text-xs text-[var(--fg-secondary)] mt-1">ローカルキャッシュを表示しています（オフラインまたはRSS取得に失敗）</div>
        </div>
      </div>
    </div>
  );
}

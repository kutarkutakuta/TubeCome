'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ZoomableThumbnail from '@/components/video/ZoomableThumbnail';
import NewVideoBadge from './NewVideoBadge';
import CommentBadgeClient from './CommentBadgeClient';
import VideoStatsClient from '@/app/videos/[id]/components/VideoStatsClient';
import CaptureVideoListClient from './CaptureVideoListClient';
import { formatJaShortDateTime } from '@/utils/date';
import { decodeHtml } from '@/utils/html';
import { getChannel, getChannelEntries, saveChannelEntries, addChannel, updateChannel } from '@/utils/indexeddb';

type Props = { channelId: string };

export default function ChannelClientView({ channelId }: Props) {
  const [channel, setChannel] = useState<any | null>(null);
  const [entries, setEntries] = useState<Array<any> | null>(null);
  const [updating, setUpdating] = useState(false);
  const [statsMap, setStatsMap] = useState<Record<string, any>>({});

  useEffect(() => {
    let mounted = true;
    const loadFromCache = async () => {
      try {
        const c = await getChannel(channelId);
        const e = await getChannelEntries(channelId);
        if (!mounted) return;
        setChannel(c);
        setEntries(e);
      } catch (err) {
        // ignore
      }
    };
    loadFromCache();

    const onChange = () => loadFromCache();
    window.addEventListener('channels-changed', onChange);
    return () => {
      mounted = false;
      window.removeEventListener('channels-changed', onChange);
    };
  }, [channelId]);

  useEffect(() => {
    // Background fetch to update from server
    let mounted = true;
    const fetchAndUpdate = async () => {
      setUpdating(true);
      try {
        const res = await fetch(`/api/channel-entries?channelId=${encodeURIComponent(channelId)}`);
        if (!res.ok) return;
        const json = await res.json();
        const remoteEntries = json.entries || [];
        const feedTitle = json.feedTitle;
        if (mounted) {
          setEntries(remoteEntries);
          // Save to indexeddb
          try {
            await saveChannelEntries(channelId, remoteEntries);
            if (feedTitle) {
              // update channel title and thumbnail (use first entry thumbnail if available)
              const thumb = remoteEntries && remoteEntries.length > 0 ? remoteEntries[0].thumbnail : undefined;
              await updateChannel(channelId, { title: decodeHtml(feedTitle || ''), thumbnail: thumb });
              // ensure channel exists in list
              await addChannel(channelId, decodeHtml(feedTitle || ''), thumb).catch(() => {});
            }
          } catch (e) {
            // ignore saving errors
          }
        }

        // Fetch video stats for first up to 50 entries
        try {
          const ids = remoteEntries.slice(0, 50).map((r: any) => r.id).filter(Boolean);
          if (ids.length > 0) {
            const sres = await fetch(`/api/video-stats?ids=${ids.join(',')}`);
            if (sres.ok) {
              const sj = await sres.json();
              if (mounted) setStatsMap(sj.stats || {});
            }
          }
        } catch (e) {
          // ignore stats errors
        }

      } catch (err) {
        // ignore fetch errors
      } finally {
        if (mounted) setUpdating(false);
      }
    };

    fetchAndUpdate();

    return () => { mounted = false; };
  }, [channelId]);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="win-window win-title-bar mb-4">
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="text-lg font-bold">
            {channel?.title ?? (entries && entries.length > 0 ? entries[0].title : 'チャンネル')}
          </div>
          <div className="text-xs text-[var(--fg-secondary)] md:whitespace-nowrap md:text-right mt-1 md:mt-0">チャンネルID: {channelId || ''}</div>
        </div>
      </div>

      <div className="space-y-3">
        {!entries && (
          <div className="win-window win-inset p-4">読み込み中…</div>
        )}
        {entries && entries.length === 0 && (
          <div className="win-window win-inset p-4">このチャンネルに動画が見つかりませんでした。</div>
        )}
        {entries && entries.map((v: any) => (
          <div key={v.id} className="win-window win-inset p-3 flex items-start gap-3">
            <div className="w-24">
              <ZoomableThumbnail containerClassName={"h-14 win-outset overflow-hidden rounded-sm bg-[var(--bg-panel)]"} src={v.thumbnail ?? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt={`サムネイル: ${v.title}`} width={160} height={90} />
              <div className="mt-2 text-center">
                <a className="win-btn text-xs block flex items-center justify-center yt-btn" href={v.link} target="_blank" rel="noreferrer">
                  <span>YouTube</span>
                </a>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <Link href={`/videos/${v.id}`} className="text-sm font-bold text-[var(--fg-primary)] line-clamp-2 break-words min-w-0 block">{decodeHtml(v.title)}</Link>
                <NewVideoBadge channelId={channelId} publishedDate={v.published} />
                <CommentBadgeClient videoId={v.id} currentCount={statsMap[v.id]?.commentCount} />
                {v.durationSeconds && (
                  <div className="text-[10px] bg-[var(--bg-panel)] px-1 rounded text-[var(--fg-secondary)]">{(function(){ const s = parseInt(v.durationSeconds,10); if (Number.isNaN(s)) return null; const mm = Math.floor(s/60); const ss = s%60; return `${mm}:${ss.toString().padStart(2,'0')}` })()}</div>
                )}
              </div>
              <div className="text-sm text-[var(--fg-secondary)] mt-1 flex items-center gap-0">公開日時：<div className="min-w-0">{formatJaShortDateTime(v.published)}</div></div>
              <div className="mt-1"><VideoStatsClient statistics={statsMap[v.id] ?? undefined} /></div>
            </div>
          </div>
        ))}
      </div>

      {entries && <CaptureVideoListClient list={entries.map((e:any) => ({ id: e.id, title: e.title }))} channelId={channelId} />}
    </div>
  );
}

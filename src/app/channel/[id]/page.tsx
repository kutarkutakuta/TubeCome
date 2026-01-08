import React from 'react';
import Link from 'next/link';
import { Badge } from 'antd';
import ZoomableThumbnail from '@/components/ZoomableThumbnail';
import MarkChannelVisited from '@/components/MarkChannelVisited';
import CommentBadgeClient from '@/components/CommentBadgeClient';
import NewVideoBadge from '@/components/NewVideoBadge';
import { getVideoStatistics } from '@/lib/youtube';
import PrefetchStats from '@/components/PrefetchStats';
import CaptureVideoListClient from '@/components/CaptureVideoListClient';
import { decodeHtml } from '@/utils/html';
import { formatJaShortDateTime } from '@/utils/date';
import { YoutubeOutlined } from '@ant-design/icons';

type Props = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function ChannelPage({ params }: Props) {
  const { id } = await params as { id: string };

  // Fetch channel RSS feed
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);
    if (!res.ok) {
      return (
        <div className="p-4">
          <div className="win-window win-inset p-4">
            <div className="win-title-bar">チャンネル</div>
            <div className="p-4">チャンネルの情報を取得できませんでした（status: {res.status}）</div>
          </div>
        </div>
      );
    }

    const text = await res.text();
    const feedTitleMatch = text.match(/<title>([^<]+)<\/title>/);
    const feedTitle = feedTitleMatch ? decodeHtml(feedTitleMatch[1]) : id;

    let entries: Array<{ id: string; title: string; published: string; link: string; thumbnail?: string; description?: string; durationSeconds?: string; author?: string }> = [];
    const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
    let m;
    const authorRe = /<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/;
    while ((m = entryRe.exec(text)) !== null) {
      const block = m[1];
      const vid = (block.match(/<yt:videoId>(.*?)<\/yt:videoId>/) || [])[1];
      const title = (block.match(/<title>(.*?)<\/title>/) || [])[1];
      const published = (block.match(/<published>(.*?)<\/published>/) || [])[1];
      const link = (block.match(/<link[^>]+href="([^"]+)"/) || [])[1];
      const thumbnail = (block.match(/<media:thumbnail[^>]+url="([^"]+)"/) || [])[1];
      let description = (block.match(/<media:description>([\s\S]*?)<\/media:description>/) || [])[1];
      if (description) description = description.replace(/<[^>]+>/g, '').trim();
      const durationSeconds = (block.match(/<yt:duration[^>]+seconds="([^"]+)"/) || [])[1];
      const author = (block.match(authorRe) || [])[1];
      if (vid) entries.push({ id: vid, title: title ?? vid, published: published ?? '', link: link ?? `https://www.youtube.com/watch?v=${vid}`, thumbnail: thumbnail ?? undefined, description: description ?? undefined, durationSeconds: durationSeconds ?? undefined, author: author ?? undefined });
    }

    function formatDuration(sec?: string | undefined) {
      if (!sec) return null;
      const s = parseInt(sec, 10);
      if (Number.isNaN(s)) return null;
      const mm = Math.floor(s / 60);
      const ss = s % 60;
      return `${mm}:${ss.toString().padStart(2, '0')}`;
    }

    // Sort entries by published date (newest first) and keep recent 50
    entries.sort((a, b) => {
      const ta = a.published ? new Date(a.published).getTime() : 0;
      const tb = b.published ? new Date(b.published).getTime() : 0;
      return tb - ta;
    });

    // Limit to most recent 50 items (RSS may include many)
    entries = entries.slice(0, 50);
    const firstIds = entries.map(e => e.id);
    const statsMap = firstIds.length > 0 ? await getVideoStatistics(firstIds) : {};

    return (
      <div className="p-4 max-w-3xl mx-auto">
        <MarkChannelVisited channelId={id} />
        <div className="win-window win-title-bar mb-4">
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="text-lg font-bold">{feedTitle}</div>
          <div className="text-xs text-[var(--fg-secondary)] md:whitespace-nowrap md:text-right mt-1 md:mt-0">チャンネルID: {id || ''}</div>
        </div>
        </div>
        <div className="space-y-3">
          {entries.length === 0 && (
            <div className="win-window win-inset p-4">このチャンネルに動画が見つかりませんでした。</div>
          )}
          {entries.map((v) => {
            const s = statsMap[v.id];
            return (
              <div key={v.id} className="win-window win-inset p-3 flex items-start gap-3">
                <div className="w-24">
                  <ZoomableThumbnail containerClassName={"h-14 win-outset overflow-hidden rounded-sm bg-[var(--bg-panel)]"} src={v.thumbnail ?? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt={`サムネイル: ${v.title}`} width={160} height={90} />
                  <div className="mt-2 text-center">
                    <a className="win-btn text-xs block flex items-center justify-center yt-btn" href={v.link} target="_blank" rel="noreferrer">
                      <YoutubeOutlined style={{ marginRight: 6 }} />
                      <span>YouTube</span>
                    </a>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <Link href={`/videos/${v.id}`} className="text-sm font-bold text-[var(--fg-primary)] line-clamp-2 break-words min-w-0 block">{decodeHtml(v.title)}</Link>
                    <NewVideoBadge channelId={id} publishedDate={v.published} />
                    <CommentBadgeClient videoId={v.id} currentCount={s?.commentCount} />
                    {v.durationSeconds && (
                      <div className="text-[10px] bg-[var(--bg-panel)] px-1 rounded text-[var(--fg-secondary)]">{formatDuration(v.durationSeconds)}</div>
                    )}
                  </div>
                  <div className="text-sm text-[var(--fg-secondary)] mt-1">
                    {formatJaShortDateTime(v.published)}
                    {s && ` • 再生数: ${s.viewCount?.toLocaleString() ?? '—'}`}
                    {s && s.likeCount ? ` • 高評価: ${s.likeCount.toLocaleString()}` : ''}
                    {s && s.commentCount ? ` • コメント数: ${s.commentCount.toLocaleString()}` : ''}
                  </div>
                  {/* {v.description && (
                    <div className="text-sm mt-2 text-[var(--fg-secondary)]">{v.description.length > 100 ? `${v.description.slice(0, 100)}…` : v.description}</div>
                  )} */}

                </div>
              </div>
            );
          })}
        </div>

        {/* Prefetch up to 50 IDs in background */}
        <PrefetchStats ids={entries.map(e => e.id)} />
        {/* Capture this list for client-side prev/next navigation */}
        <CaptureVideoListClient list={entries.map(e => ({ id: e.id, title: e.title }))} channelId={id} />
      </div>
    );
  } catch (err) {
    return (
      <div className="p-4">
        <div className="win-window win-inset p-4">
          <div className="win-title-bar">チャンネル</div>
          <div className="p-4">エラーが発生しました: {String(err)}</div>
        </div>
      </div>
    );
  }
}

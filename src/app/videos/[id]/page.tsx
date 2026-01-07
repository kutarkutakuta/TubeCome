import React from 'react';
import Image from 'next/image';
import { getVideoDetails, getCommentThreads } from '@/lib/youtube';

type Props = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function VideoPage({ params }: Props) {
  const { id } = await params as { id: string };

  try {
    // video details
    const details = await getVideoDetails(id);
    if (!details) {
      return (
        <div className="p-4">
          <div className="win-window win-inset p-4">
            <div className="win-title-bar">動画</div>
            <div className="p-4">動画が見つかりませんでした。</div>
          </div>
        </div>
      );
    }

    // comments (fetch top-level threads, include replies)
    const commentsResp = await getCommentThreads({ videoId: id, maxResults: 100 });

    // normalize threads into flat array: root then replies
    const posts: Array<{ id: string; author: string; authorChannelId?: string; parentId?: string; text: string; publishedAt: string; likeCount?: number; isReply?: boolean; shortId?: string; isDeleted?: boolean }> = [];

    for (const thread of commentsResp.items || []) {
      const top = thread.snippet?.topLevelComment?.snippet;
      if (top) {
        const text = top.textDisplay ?? '';
        const authorChannelId = top.authorChannelId?.value;
        const shortId = (authorChannelId || thread.id || '').toString().slice(0, 8);
        const isDeleted = !text || /removed|deleted|削除|This comment has been removed/i.test(text);
        posts.push({ id: thread.id as string, author: top.authorDisplayName || '名無しさん', authorChannelId, text: text, publishedAt: top.publishedAt || '', likeCount: typeof top.likeCount === 'number' ? top.likeCount : undefined, shortId, isDeleted });
      }
      const replies = thread.replies?.comments || [];
      for (const r of replies) {
        const rs = r.snippet;
        const text = rs?.textDisplay ?? '';
        const authorChannelId = rs?.authorChannelId?.value;
        const shortId = (authorChannelId || r.id || '').toString().slice(0, 8);
        const isDeleted = !text || /removed|deleted|削除|This comment has been removed/i.test(text);
        posts.push({ id: r.id as string, author: rs?.authorDisplayName || '名無しさん', authorChannelId, parentId: thread.id, text: text, publishedAt: rs?.publishedAt || '', likeCount: typeof rs?.likeCount === 'number' ? rs?.likeCount : undefined, isReply: true, shortId, isDeleted });
      }
    }

    // Sort posts by published date (oldest first)
    posts.sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return ta - tb;
    });

    function formatDate(iso?: string) {
      if (!iso) return '';
      const d = new Date(iso);
      const YYYY = d.getFullYear();
      const MM = String(d.getMonth() + 1).padStart(2, '0');
      const DD = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${YYYY}/${MM}/${DD} ${hh}:${mm}:${ss}`;
    }

    function renderCommentText(text: string) {
      const parts = text.split(/(>>\d+)/g);
      return (
        <>
          {parts.map((part, i) => {
            const m = part.match(/^>>(\d+)$/);
            if (m) {
              return <a key={i} href={`#post-${m[1]}`} className="text-blue-600 underline">&gt;&gt;{m[1]}</a>;
            }
            return <span key={i}>{part}</span>;
          })}
        </>
      );
    }

    return (
      <div className="p-4 max-w-3xl mx-auto">
        <div className="win-window win-title-bar mb-4">
          <div className="text-lg font-bold">{details.title}</div>
          <div className="text-xs text-[var(--fg-secondary)]">{details.channelTitle} • {new Date(details.publishedAt).toLocaleString('ja-JP')}</div>
        </div>

        <div className="win-window p-3 mb-4">
          <div className="flex gap-4">
            <div className="w-48 h-28 win-outset overflow-hidden rounded-sm bg-[var(--bg-panel)]">
              <Image src={details.thumbnail} alt={`サムネイル: ${details.title}`} width={320} height={180} className="object-cover w-full h-full" />
            </div>
            <div className="flex-1">
              <div className="text-sm mb-2">{details.description ? (details.description.length > 300 ? details.description.slice(0, 300) + '…' : details.description) : ''}</div>
              <div className="text-xs text-[var(--fg-secondary)]">再生数: {details.statistics?.viewCount?.toLocaleString() ?? '—'} • コメント: {details.statistics?.commentCount?.toLocaleString() ?? '—'}{details.statistics?.likeCount ? ` • 高評価: ${details.statistics.likeCount.toLocaleString()}` : ''}</div>
            </div>
          </div>
        </div>

        <div className="win-window win-title-bar mb-2">コメント</div>
        <div className="space-y-1">
          {posts.length === 0 && (
            <div className="win-window win-inset p-4">コメントが見つかりませんでした。</div>
          )}

          {(() => {
            // Group replies under their parent and create a display order
            const byParent = new Map<string, typeof posts[0][]>();
            for (const p of posts) {
              if (p.parentId) {
                const arr = byParent.get(p.parentId) || [];
                arr.push(p);
                byParent.set(p.parentId, arr);
              }
            }
            // sort replies by publishedAt ascending
            for (const arr of byParent.values()) {
              arr.sort((a, b) => (new Date(a.publishedAt).getTime() || 0) - (new Date(b.publishedAt).getTime() || 0));
            }

            const topLevel = posts.filter((p) => !p.parentId).sort((a, b) => (new Date(a.publishedAt).getTime() || 0) - (new Date(b.publishedAt).getTime() || 0));
            const display: typeof posts = [];
            for (const t of topLevel) {
              display.push(t);
              const replies = byParent.get(t.id) || [];
              for (const r of replies) display.push(r);
            }

            const idToIndex = new Map(display.map((p, i) => [p.id, i + 1]));

            return display.map((p, idx) => {
              const num = idx + 1;

              if (p.isDeleted) {
                return (
                  <div key={p.id} id={`post-${num}`} className="mb-6">
                    <div className="text-[var(--fg-secondary)]">{num} : <span className="font-bold">【あぼーん】</span></div>
                  </div>
                );
              }

              const parentNum = p.parentId ? idToIndex.get(p.parentId) : undefined;

              return (
                <div key={p.id} id={`post-${num}`} className="mb-6 break-words font-mono">
                  <div className="mb-2 text-sm text-[var(--fg-secondary)]">
                    {num} : 
                    <span className="font-bold text-[var(--fg-primary)]">
                      {p.authorChannelId && p.authorChannelId === details.channelId ? (
                        <span className="owner-prefix">うｐ主</span>
                      ) : (
                        <span className="text-[var(--fg-secondary)]">名無しさん</span>
                      )}
                      {p.author ? <span className="ml-1">{p.author}</span> : null}
                    </span>
                    {' '} : {formatDate(p.publishedAt)} ID:{p.shortId}
                  </div>
                  <div className="ml-4 text-base text-[var(--fg-primary)] whitespace-pre-wrap leading-relaxed">
                    {typeof parentNum === 'number' && (
                      <>
                        <a href={`#post-${parentNum}`} className="text-blue-600 underline">&gt;&gt;{parentNum}</a>
                        <br />
                      </>
                    )}
                    {renderCommentText(p.text)}
                  </div>
                  {typeof p.likeCount === 'number' && p.likeCount > 0 && <div className="ml-4 mt-1 text-xs text-[var(--fg-secondary)]">（いいね: {p.likeCount}）</div>}
                </div>
              );
            });
          })()}
          <div className="mt-4 text-right text-xs"><a href="#top" className="text-[var(--fg-secondary)]">トップへ</a></div>
        </div>
      </div>
    );
  } catch (err) {
    return (
      <div className="p-4">
        <div className="win-window win-inset p-4">
          <div className="win-title-bar">動画</div>
          <div className="p-4">エラーが発生しました: {String(err)}</div>
        </div>
      </div>
    );
  }
}

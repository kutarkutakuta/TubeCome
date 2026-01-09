import React from 'react';
import Link from 'next/link';
import ZoomableThumbnail from '@/components/video/ZoomableThumbnail';
import SaveVideoStats from '@/app/videos/[id]/components/SaveVideoStats';
import LastViewedMarker from '@/app/videos/[id]/components/LastViewedMarker';
import { getVideoDetails, getCommentThreads } from '@/lib/youtube';
import { LikeOutlined, DislikeOutlined, YoutubeOutlined } from '@ant-design/icons';
import { linkify } from '@/utils/linkify';
import { decodeHtml } from '@/utils/html';
import { formatJaShortDateTime } from '@/utils/date';
import AuthorPostsPreview from '@/app/videos/[id]/components/AuthorPostsPreview';
import ReplyPreview from '@/app/videos/[id]/components/ReplyPreview';
import CommentAuthor from '@/components/comment/CommentAuthor';
import FullDescriptionDrawer from '@/app/videos/[id]/components/FullDescriptionDrawer';
import ScrollToBottomClient from '@/app/videos/[id]/components/ScrollToBottomClient';
import ScrollToTopClient from '@/app/videos/[id]/components/ScrollToTopClient';
import PrevNextClient from '@/app/videos/[id]/components/PrevNextClient';

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
    const posts: Array<{ id: string; author: string; authorChannelId?: string; parentId?: string; text: string; publishedAt: string; likeCount?: number; dislikeCount?: number; isReply?: boolean; shortId?: string; isDeleted?: boolean }> = [];

    for (const thread of commentsResp.items || []) {
      const top = thread.snippet?.topLevelComment?.snippet;
      if (top) {
        const text = top.textDisplay ?? '';
        const authorChannelId = top.authorChannelId?.value;
        const shortId = (authorChannelId || thread.id || '').toString().slice(0, 8);
        const isDeleted = !text || /removed|deleted|削除|This comment has been removed/i.test(text);
        const topObj: any = { id: thread.id as string, author: top.authorDisplayName || '名無しさん', text: text, publishedAt: top.publishedAt || '', likeCount: typeof top.likeCount === 'number' ? top.likeCount : undefined, shortId, isDeleted };
        if (authorChannelId != null) topObj.authorChannelId = authorChannelId;
        posts.push(topObj as typeof posts[0]);
      }
      const replies = thread.replies?.comments || [];
      for (const r of replies) {
        const rs = r.snippet;
        const text = rs?.textDisplay ?? '';
        const authorChannelId = rs?.authorChannelId?.value;
        const authorChannelIdSafe = (authorChannelId == null ? undefined : authorChannelId) as string | undefined;
        const shortId = (authorChannelIdSafe || r.id || '').toString().slice(0, 8);
        const isDeleted = !text || /removed|deleted|削除|This comment has been removed/i.test(text);
        const replyObj: any = { id: r.id as string, author: rs?.authorDisplayName || '名無しさん', parentId: thread.id, text: text, publishedAt: rs?.publishedAt || '', likeCount: typeof rs?.likeCount === 'number' ? rs?.likeCount : undefined, isReply: true, shortId, isDeleted };
        if (authorChannelIdSafe != null) replyObj.authorChannelId = authorChannelIdSafe;
        posts.push(replyObj as typeof posts[0]);
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
      const YY = String(d.getFullYear() % 100).padStart(2, '0');
      const MM = String(d.getMonth() + 1).padStart(2, '0');
      const DD = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${YY}/${MM}/${DD} ${hh}:${mm}:${ss}`;
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
            return <span key={i}>{linkify(part)}</span>;
          })}
        </>
      );
    }



    return (
      <div className="p-4 max-w-3xl mx-auto">
        <SaveVideoStats videoId={id} totalComments={posts.length} />
        <LastViewedMarker videoId={id} />

        <div className="win-window p-3 mb-4">
          <div className="flex flex-row gap-4 items-start">
            <div className="w-32 min-w-[8rem] flex-shrink-0">
                <ZoomableThumbnail src={details.thumbnail} alt={`サムネイル: ${decodeHtml(details.title)}`} width={240} height={135} />
              <div className="mt-2 text-center">
                <a className="win-btn text-xs block flex items-center justify-center yt-btn" href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer">
                  <YoutubeOutlined style={{ marginRight: 6 }} />
                  <span>YouTube</span>
                </a>
              </div>

            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base sm:text-lg font-bold break-words" title={decodeHtml(details.title)}>{decodeHtml(details.title)}</div>
              <div className="text-sm text-[var(--fg-secondary)]">{details.channelTitle} • {formatJaShortDateTime(details.publishedAt)}</div>
              <div className="mt-2 text-sm text-[var(--fg-secondary)]">再生数: {details.statistics?.viewCount?.toLocaleString() ?? '—'}{details.statistics?.likeCount ? ` • 高評価: ${details.statistics.likeCount.toLocaleString()}` : ''}</div>
            </div>
          </div>

          <div className="mt-4 text-sm break-words">
            {details.description ? (
              details.description.length > 300 ? (
                <>
                  {linkify(details.description.slice(0, 300))}…
                  <FullDescriptionDrawer description={details.description} />
                </>
              ) : (
                <>{linkify(details.description)}</>
              )
            ) : ''}
          </div>
        </div>

        <div className="win-window win-title-bar mb-2">コメント{typeof details.statistics?.commentCount === 'number' ? `（${details.statistics.commentCount.toLocaleString()}）` : ''}</div>
        <div className="space-y-1">
          {posts.length === 0 && (
            <div className="win-window win-inset p-4">コメントが見つかりませんでした。</div>
          )}

          {(() => {
            // Build chronological mapping (oldest-first)
            const chrono = [...posts].sort((a, b) => (new Date(a.publishedAt).getTime() || 0) - (new Date(b.publishedAt).getTime() || 0));
            const chronMap = new Map(chrono.map((p, i) => [p.id, i + 1]));

            // Build per-author chronological lists (for this video)
            const authorGroups = new Map() as Map<string, string[]>;
            for (const p of chrono) {
              const key = p.authorChannelId || p.shortId || p.author || p.id;
              const arr = authorGroups.get(key) || [];
              arr.push(p.id);
              authorGroups.set(key, arr);
            }

            return chrono.map((p) => {
              const num = chronMap.get(p.id) || 0;

              if (p.isDeleted) {
                return (
                  <div key={p.id} id={`post-${num}`} className="mb-6">
                    <div className="text-[var(--fg-secondary)]">{num} : <span className="font-bold">【あぼーん】</span></div>
                  </div>
                );
              }

              const parentNum = p.parentId ? chronMap.get(p.parentId) : undefined;
              const parentObj = p.parentId ? posts.find(x => x.id === p.parentId) : undefined;
              const parentSnippet = parentObj ? (parentObj.text || '').replace(/\n/g, ' ').slice(0, 240) : undefined;
              const parentAuthor = parentObj?.author;
              const parentPublishedAt = parentObj?.publishedAt;
              const parentShortId = parentObj?.shortId;
              const parentIsOwner = parentObj?.authorChannelId && parentObj.authorChannelId === details.channelId;

              // compute author's post index and total
              const authorKey = p.authorChannelId || p.shortId || p.author || p.id;
              const group = authorGroups.get(authorKey) || [];
              const authorIndex = group.indexOf(p.id) + 1;
              const authorTotal = group.length;

              // build items for preview (keep chronological order)
              const items = group.map(id => {
                const itNum = chronMap.get(id) || 0;
                const postObj = posts.find(x => x.id === id);
                const snippet = (postObj?.text || '').replace(/\n/g, ' ').slice(0, 200);
                const authorNameItem = postObj?.author || '名無しさん';
                const publishedAtItem = postObj?.publishedAt || '';
                const pIsOwner = postObj?.authorChannelId && postObj.authorChannelId === details.channelId;
                
                const parentNumIt = postObj?.parentId ? (chronMap.get(postObj.parentId as string) || undefined) : undefined;
                const parentObjIt = postObj?.parentId ? posts.find(x => x.id === postObj.parentId) : undefined;
                const parentSnippetIt = parentObjIt ? (parentObjIt.text || '').slice(0, 200) : undefined;
                const parentAuthorIt = parentObjIt?.author;
                const parentPublishedAtIt = parentObjIt?.publishedAt;
                const parentIsOwnerIt = parentObjIt?.authorChannelId && parentObjIt.authorChannelId === details.channelId;
                
                return { 
                  id, num: itNum, snippet, 
                  authorName: authorNameItem, publishedAt: publishedAtItem, 
                  shortId: postObj?.shortId, isOwner: !!pIsOwner,
                  parentNum: parentNumIt, parentSnippet: parentSnippetIt, 
                  parentAuthor: parentAuthorIt, parentPublishedAt: parentPublishedAtIt,
                  parentIsOwner: !!parentIsOwnerIt, parentShortId: parentObjIt?.shortId
                };
              }).sort((a,b) => a.num - b.num);

              const isOwner = p.authorChannelId && p.authorChannelId === details.channelId;

              return (
                <div key={p.id} id={`post-${num}`} data-comment-num={num} className="mb-6 break-words font-mono">
                  <div className="mb-2 text-sm text-[var(--fg-secondary)] flex flex-wrap items-center">
                    <span className="mr-2">{num} :</span>
                    
                    <CommentAuthor authorName={p.author || '名無しさん'} isOwner={!!isOwner} shortId={p.shortId}>
                      {authorTotal > 1 ? (
                          <AuthorPostsPreview items={items} authorIndex={authorIndex} authorTotal={authorTotal} authorName={p.author} isOwner={!!isOwner} shortId={p.shortId} />
                      ) : p.author}
                    </CommentAuthor>

                    <span className="mx-2">: {formatDate(p.publishedAt)}</span>
                    <span className="ml-2 vote-badges">
                      {typeof p.likeCount === 'number' && p.likeCount > 0 ? (
                        <span className="vote-badge like"><LikeOutlined className="anticon" /><span className="vote-count">{p.likeCount.toLocaleString()}</span></span>
                      ) : null}
                      {typeof p.dislikeCount === 'number' && p.dislikeCount > 0 ? (
                        <span className="vote-badge dislike"><DislikeOutlined className="anticon" /><span className="vote-count">{p.dislikeCount.toLocaleString()}</span></span>
                      ) : null}
                    </span>
                  </div>
                  <div className="ml-4 text-base text-[var(--fg-primary)] whitespace-pre-wrap leading-relaxed break-words">
                    {typeof parentNum === 'number' && (
                      <>
                        <ReplyPreview parentNum={parentNum} snippet={parentSnippet} authorName={parentAuthor} publishedAt={parentPublishedAt} shortId={parentShortId} isOwner={!!parentIsOwner} />
                      </>
                    )}
                    {renderCommentText(p.text)}
                  </div>
                </div>
              );
            });
          })()}
          <div>
            <ScrollToTopClient />
            <ScrollToBottomClient />
          </div>

          {/* prev/next links from client-side list if available */}
          <div>
            <PrevNextClient currentId={id} />
          </div>

          <div className="mt-4 text-sm flex gap-4 justify-center">
            {details.channelId ? (
              <Link href={`/channel/${encodeURIComponent(details.channelId)}`} className="inline-flex items-center gap-2 max-w-full sm:max-w-[45%] text-sm font-bold text-[var(--fg-primary)]">動画一覧へ戻る</Link>
            ) : null}
          </div>


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

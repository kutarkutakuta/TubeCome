'use client';

import { useState, useEffect } from 'react';
import { LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import { linkify } from '@/utils/linkify';
import AuthorPostsPreview from '@/app/videos/[id]/components/AuthorPostsPreview';
import ReplyPreview from '@/app/videos/[id]/components/ReplyPreview';
import CommentAuthor from '@/app/videos/[id]/components/CommentAuthor';
import { getVideoComments, saveVideoComments, getViewedCommentIds } from '@/utils/indexeddb';

interface Comment {
  id: string;
  author: string;
  authorChannelId?: string;
  parentId?: string;
  text: string;
  publishedAt: string;
  likeCount?: number;
  dislikeCount?: number;
  isReply?: boolean;
  shortId?: string;
  isDeleted?: boolean;
  hasMore?: boolean;
}

export default function CommentsDisplay({
  videoId,
  serverComments,
  channelId
}: {
  videoId: string;
  serverComments: Comment[];
  channelId: string;
}) {
  const [posts, setPosts] = useState<Comment[]>(serverComments);
  const [missingIds, setMissingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  async function testGapDetection() {
    const cachedComments = await getVideoComments(videoId);
    const base = cachedComments || serverComments;
    
    // Find newest comment
    const sortedByDate = [...base].sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    const newest = sortedByDate[0];
    
    // Create a fake newer comment
    const fakeComment: Comment = {
      id: 'FAKE_COMMENT_' + Date.now(),
      author: 'テストユーザー',
      text: 'これは架空のコメントです（抜け検出テスト用）',
      publishedAt: new Date(new Date(newest.publishedAt).getTime() + 60000).toISOString(), // 1分後
      shortId: 'FAKE1234',
      isDeleted: false
    };
    
    const withFake = [fakeComment, ...base];
    await saveVideoComments(videoId, withFake);
    alert(`架空の新しいコメントを追加しました（${base.length}件 → ${withFake.length}件）\nID: ${fakeComment.id}\nリロードすると警告が表示されます。`);
  }

  useEffect(() => {

    /** クライアントサイドでのコメントとサーバーコメントのマージ処理 */
    async function mergeComments() {
      try {
        const cachedComments = await getVideoComments(videoId);
        
        let mergedComments: Comment[] = [];
        const commentMap = new Map<string, Comment>();
        const missing = new Set<string>();
        
        // Keep track of hasMore flag from server comments
        const hasMoreIds = new Set(serverComments.filter(c => c.hasMore).map(c => c.id));

        if (cachedComments && cachedComments.length > 0) {
          const serverIds = new Set(serverComments.map(c => c.id));
          
          for (const comment of cachedComments) {
            commentMap.set(comment.id, comment);
            // Check if cached comment is missing from server response
            if (!serverIds.has(comment.id)) {
              missing.add(comment.id);
            }
          }
        }

        for (const comment of serverComments) {
          commentMap.set(comment.id, comment);
        }

        mergedComments = Array.from(commentMap.values());
        mergedComments.sort((a, b) => {
          const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return ta - tb;
        });

        // Re-apply hasMore flag to the first comment (oldest).
        // Preserve server-indicated hasMore unless we can confirm cached comments include older items that fill the gap.
        if (mergedComments.length > 0) {
          const serverHasMore = serverComments.some(c => c.hasMore);
          if (serverHasMore) {
            const earliestServerTs = Math.min(...serverComments.map(c => new Date(c.publishedAt).getTime()));
            const hasCachedEarlier = !!(cachedComments && cachedComments.some(c => new Date(c.publishedAt).getTime() < earliestServerTs));
            // If we have cached comments older than the earliest server comment, we can clear hasMore
            mergedComments[0].hasMore = !hasCachedEarlier;
          } else {
            // Fall back to missing-id heuristic
            mergedComments[0].hasMore = missing.size > 0;
          }
        }

        await saveVideoComments(videoId, mergedComments);

        setPosts(mergedComments);
        setMissingIds(missing);
        
        const debugMsg = `Merged: ${mergedComments.length}件 (Cache: ${cachedComments?.length || 0}, Server: ${serverComments.length})\nMissing: ${missing.size}件`;
        setDebugInfo(debugMsg);
        console.log('[Comment Merge]', debugMsg);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to merge comments:', err);
        setPosts(serverComments);
        setLoading(false);
      }
    }

    mergeComments();

    // Load viewed IDs for UI and listen for updates
    let mounted = true;
    async function loadViewed() {
      try {
        const ids = await getViewedCommentIds(videoId);
        if (!mounted) return;
        setViewedIds(new Set(ids || []));
      } catch (e) {
        // ignore
      }
    }
    loadViewed();

    function onViewedChanged(e: any) {
      if (!e?.detail?.videoId) return;
      if (e.detail.videoId === videoId) {
        loadViewed();
      }
    }
    window.addEventListener('viewed-comments-changed', onViewedChanged as EventListener);

    return () => { mounted = false; window.removeEventListener('viewed-comments-changed', onViewedChanged as EventListener); };
  }, [videoId, serverComments]);

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

  const chrono = [...posts].sort((a, b) => (new Date(a.publishedAt).getTime() || 0) - (new Date(b.publishedAt).getTime() || 0));
  const chronMap = new Map(chrono.map((p, i) => [p.id, i + 1]));
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  const authorGroups = new Map() as Map<string, string[]>;
  for (const p of chrono) {
    const key = p.authorChannelId || p.shortId || p.author || p.id;
    const arr = authorGroups.get(key) || [];
    arr.push(p.id);
    authorGroups.set(key, arr);
  }

  return (
    <>
      <div className="win-window win-title-bar mb-2">
        コメント（{chrono.length.toLocaleString()}）
      </div>
      {/* <div className="mb-4 flex justify-between items-start">
        <div className="text-xs text-gray-600 whitespace-pre-wrap">{debugInfo}</div>
        <button onClick={testGapDetection} className="win-btn text-xs px-3 py-1">
          🧪 抜け検出テスト
        </button>
      </div> */}
      {chrono.length === 0 && (
        <div className="win-window win-inset p-4">コメントが見つかりませんでした。</div>
      )}
      {chrono.map((p, idx) => {
        const num = chronMap.get(p.id) || 0;
        const isViewed = viewedIds.has(p.id);

        if (p.isDeleted) {
          return (
            <div key={p.id}>
              {p.hasMore && (
                <div className="my-4 py-2 px-4 text-center text-xs font-bold bg-yellow-100 text-yellow-800 border-2 border-yellow-400 rounded">
                  ⚠️ コメントが多すぎるため省略されました。YouTubeで直接ご覧ください。
                </div>
              )}
            </div>
          );
        }

        const parentNum = p.parentId ? chronMap.get(p.parentId) : undefined;
        const parentObj = p.parentId ? posts.find(x => x.id === p.parentId) : undefined;
        const parentSnippet = parentObj ? (parentObj.text || '').replace(/\n/g, ' ').slice(0, 240) : undefined;
        const parentAuthor = parentObj?.author;
        const parentPublishedAt = parentObj?.publishedAt;
        const parentShortId = parentObj?.shortId;
        const parentIsOwner = parentObj?.authorChannelId && parentObj.authorChannelId === channelId;

        const authorKey = p.authorChannelId || p.shortId || p.author || p.id;
        const group = authorGroups.get(authorKey) || [];
        const authorIndex = group.indexOf(p.id) + 1;
        const authorTotal = group.length;

        const items = group.map(id => {
          const itNum = chronMap.get(id) || 0;
          const postObj = posts.find(x => x.id === id);
          const snippet = (postObj?.text || '').replace(/\n/g, ' ').slice(0, 200);
          const authorNameItem = postObj?.author || '名無しさん';
          const publishedAtItem = postObj?.publishedAt || '';
          const pIsOwner = postObj?.authorChannelId && postObj.authorChannelId === channelId;
          
          const parentNumIt = postObj?.parentId ? (chronMap.get(postObj.parentId as string) || undefined) : undefined;
          const parentObjIt = postObj?.parentId ? posts.find(x => x.id === postObj.parentId) : undefined;
          const parentSnippetIt = parentObjIt ? (parentObjIt.text || '').slice(0, 200) : undefined;
          const parentAuthorIt = parentObjIt?.author;
          const parentPublishedAtIt = parentObjIt?.publishedAt;
          const parentIsOwnerIt = parentObjIt?.authorChannelId && parentObjIt.authorChannelId === channelId;
          
          return { 
            id, num: itNum, snippet, 
            authorName: authorNameItem, publishedAt: publishedAtItem, 
            shortId: postObj?.shortId, isOwner: !!pIsOwner,
            parentNum: parentNumIt, parentSnippet: parentSnippetIt, 
            parentAuthor: parentAuthorIt, parentPublishedAt: parentPublishedAtIt,
            parentIsOwner: !!parentIsOwnerIt, parentShortId: parentObjIt?.shortId
          };
        }).sort((a,b) => a.num - b.num);

        const isOwner = p.authorChannelId && p.authorChannelId === channelId;

        return (
          <div key={p.id}>
            {p.hasMore && (
              <div className="my-4 py-2 px-4 text-center text-xs font-bold bg-yellow-100 text-yellow-800 border-2 border-yellow-400 rounded">
                ⚠️ コメントが多すぎるため、一部のみ表示しています。さらに古いコメントを表示するには、YouTubeで直接ご覧ください。
              </div>
            )}
            <div id={`post-${num}`} data-comment-num={num} data-comment-id={p.id} className={`mb-6 break-words font-mono ${isViewed ? 'bg-gray-100' : ''}`}>
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
          </div>
        );
      })}
    </>
  );
}

import React from 'react';
import Link from 'next/link';
import ZoomableThumbnail from '@/components/video/ZoomableThumbnail';
import SaveVideoStats from '@/app/videos/[id]/components/SaveVideoStats';
import LastViewedMarker from '@/app/videos/[id]/components/LastViewedMarker';
import CommentsDisplay from '@/app/videos/[id]/components/CommentsDisplay';
import { getVideoDetails, getAllCommentThreads } from '@/lib/youtube';
import { YoutubeOutlined } from '@ant-design/icons';
import { linkify } from '@/utils/linkify';
import { decodeHtml } from '@/utils/html';
import { formatJaShortDateTime } from '@/utils/date';
import FullDescriptionDrawer from '@/app/videos/[id]/components/FullDescriptionDrawer';
import ScrollToBottomClient from '@/app/videos/[id]/components/ScrollToBottomClient';
import ScrollToTopClient from '@/app/videos/[id]/components/ScrollToTopClient';
import ScrollToMarkerClient from '@/app/videos/[id]/components/ScrollToMarkerClient';
import PrevNextClient from '@/app/videos/[id]/components/PrevNextClient';
import VideoStatsClient from '@/app/videos/[id]/components/VideoStatsClient';
import QuotaLimitCheck from '@/components/QuotaLimitCheck';

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

    // comments (fetch top-level threads, include replies) - max 5 pages
    // For testing comment gaps: temporarily set to 1 page to simulate missing comments
    const MAX_COMMENT_PAGES = parseInt(process.env.MAX_COMMENT_PAGES || '5', 10);
    const commentsResp = await getAllCommentThreads(id, MAX_COMMENT_PAGES);
    // normalize threads into flat array: root then replies
    const posts: Array<{ id: string; author: string; authorChannelId?: string; parentId?: string; text: string; publishedAt: string; likeCount?: number; dislikeCount?: number; isReply?: boolean; shortId?: string; isDeleted?: boolean; hasMore?: boolean }> = [];

    for (const thread of commentsResp.items || []) {
      const top = thread.snippet?.topLevelComment?.snippet;
      if (top) {
        const text = top.textDisplay ?? '';
        const authorChannelId = top.authorChannelId?.value;
        const shortId = (authorChannelId || thread.id || '').toString().slice(0, 8);
        const isDeleted = !text || /removed|deleted|削除|This comment has been removed/i.test(text);
        const topObj: any = { id: thread.id as string, author: top.authorDisplayName, text: text, publishedAt: top.publishedAt || '', likeCount: typeof top.likeCount === 'number' ? top.likeCount : undefined, shortId, isDeleted };
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
        const replyObj: any = { id: r.id as string, author: rs?.authorDisplayName, parentId: thread.id, text: text, publishedAt: rs?.publishedAt || '', likeCount: typeof rs?.likeCount === 'number' ? rs?.likeCount : undefined, isReply: true, shortId, isDeleted };
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

    // Mark the first post with hasMore flag if there are more comments on API side
    if (commentsResp.hasMore && posts.length > 0) {
      posts[0].hasMore = true;
    }

    return (
      <div className="p-4 max-w-3xl mx-auto">
        <QuotaLimitCheck />
        <SaveVideoStats videoId={id} totalComments={details.statistics?.commentCount ?? 0} allCommentIds={posts.map(p => p.id)} />
        <LastViewedMarker videoId={id} allCommentIds={posts.map(p => p.id)} />

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
              <div className="text-sm mt-1 text-[var(--fg-secondary)]">{details.channelTitle}（{formatJaShortDateTime(details.publishedAt)}）</div>
              {/* Desktop: keep stats here but hide on small screens */}
              <div className="mt-2 hidden sm:block">
                <VideoStatsClient statistics={details.statistics} />
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm break-words">
            {/* Mobile: show stats above description */}
            <div className="mt-1 mb-2 block sm:hidden">
              <VideoStatsClient statistics={details.statistics} />
            </div>
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

        <div className="space-y-1">

          <CommentsDisplay videoId={id} serverComments={posts} channelId={details.channelId} />

          <div>
            <ScrollToTopClient />
            <ScrollToMarkerClient />
            <ScrollToBottomClient videoId={id} allCommentIds={posts.map(p => p.id)} />
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

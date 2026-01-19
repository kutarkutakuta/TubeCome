import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const channelId = url.searchParams.get('channelId');
    if (!channelId) return NextResponse.json({ error: 'channelId required' }, { status: 400 });

    // まずRSSから取得を試みる
    let feedTitle = null;
    let entries: Array<any> = [];
    
    try {
      const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
      if (res.ok) {
        const text = await res.text();
        const feedTitleMatch = text.match(/<title>([^<]+)<\/title>/);
        feedTitle = feedTitleMatch ? feedTitleMatch[1] : null;

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
          const durationSeconds = (block.match(/<yt:duration[^>]+seconds="([^\"]+)"/) || [])[1];
          const author = (block.match(authorRe) || [])[1];
          if (vid) entries.push({ id: vid, title: title ?? vid, published: published ?? '', link: link ?? `https://www.youtube.com/watch?v=${vid}`, thumbnail: thumbnail ?? undefined, description: description ?? undefined, durationSeconds: durationSeconds ?? undefined, author: author ?? undefined });
        }
        
        if (entries.length > 0) {
          return NextResponse.json({ feedTitle, entries });
        }
      }
    } catch (rssErr) {
      console.warn('RSS fetch failed, trying API:', rssErr);
    }

    // RSSが失敗した場合、YouTube Data APIにフォールバック
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'fetch_failed' }, { status: 502 });
    }

    // チャンネル情報を取得
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`
    );
    if (!channelRes.ok) {
      return NextResponse.json({ error: 'fetch_failed' }, { status: 502 });
    }
    const channelData = await channelRes.json();
    if (channelData.items && channelData.items.length > 0) {
      feedTitle = channelData.items[0].snippet.title;
    }

    // 動画一覧を取得
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=15&order=date&type=video&key=${apiKey}`
    );
    if (!videosRes.ok) {
      return NextResponse.json({ error: 'fetch_failed' }, { status: 502 });
    }
    const videosData = await videosRes.json();
    
    if (videosData.items) {
      entries = videosData.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        published: item.snippet.publishedAt,
        link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        description: item.snippet.description,
        author: item.snippet.channelTitle
      }));
    }

    return NextResponse.json({ feedTitle, entries });
  } catch (err) {
    console.error('Error fetching channel entries:', err);
    return NextResponse.json({ error: 'fetch_error' }, { status: 502 });
  }
}

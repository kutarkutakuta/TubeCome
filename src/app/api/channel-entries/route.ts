import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const channelId = url.searchParams.get('channelId');
    if (!channelId) return NextResponse.json({ error: 'channelId required' }, { status: 400 });

    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    if (!res.ok) return NextResponse.json({ error: 'fetch_failed' }, { status: 502 });

    const text = await res.text();
    const feedTitleMatch = text.match(/<title>([^<]+)<\/title>/);
    const feedTitle = feedTitleMatch ? feedTitleMatch[1] : null;

    const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
    let m;
    const entries: Array<any> = [];
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

    return NextResponse.json({ feedTitle, entries });
  } catch (err) {
    console.error('Error fetching channel entries:', err);
    return NextResponse.json({ error: 'fetch_error' }, { status: 502 });
  }
}

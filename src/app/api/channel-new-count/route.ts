import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const channelId = url.searchParams.get('channelId');
    const lastVisited = url.searchParams.get('lastVisited');
    
    if (!channelId) {
      return NextResponse.json({ error: 'channelId required' }, { status: 400 });
    }

    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    if (!res.ok) {
      return NextResponse.json({ count: 0 });
    }
    
    const text = await res.text();
    const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
    let m;
    let count = 0;
    
    const lastVisitedTimestamp = lastVisited ? parseInt(lastVisited, 10) : 0;
    
    while ((m = entryRe.exec(text)) !== null) {
      const block = m[1];
      const publishedMatch = block.match(/<published>(.*?)<\/published>/);
      if (publishedMatch) {
        const publishedAt = new Date(publishedMatch[1]).getTime();
        if (lastVisitedTimestamp > 0 && publishedAt > lastVisitedTimestamp) {
          count++;
        }
      }
    }
    
    return NextResponse.json({ count });
  } catch (err) {
    console.error('Error fetching channel new count:', err);
    return NextResponse.json({ count: 0 });
  }
}

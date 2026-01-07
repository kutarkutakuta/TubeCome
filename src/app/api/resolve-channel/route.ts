import { NextResponse } from 'next/server';

function extractChannelIdFromUrl(url: string) {
  try {
    const u = new URL(url);
    const p = u.pathname;
    const m = p.match(/\/channel\/(UC[0-9A-Za-z_-]{20,})/);
    if (m) return m[1];
    return null;
  } catch (e) {
    return null;
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const input = (body.input || '').trim();
  if (!input) return NextResponse.json({ error: 'missing_input' }, { status: 400 });

  // If it's already a channel id
  const idMatch = input.match(/^(UC[0-9A-Za-z_-]{20,})$/);
  if (idMatch) {
    const ch = idMatch[1];
    // try to fetch channel title via RSS
    try {
      const rss = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${ch}`);
      if (rss.ok) {
        const txt = await rss.text();
        const m = txt.match(/<title>([^<]+)<\/title>/);
        const title = m ? m[1] : null;
        return NextResponse.json({ channelId: ch, channelTitle: title });
      }
    } catch (e) {}
    return NextResponse.json({ channelId: ch });
  }

  // If URL contains /channel/ID
  const fromUrl = extractChannelIdFromUrl(input);
  if (fromUrl) {
    const ch = fromUrl;
    try {
      const rss = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${ch}`);
      if (rss.ok) {
        const txt = await rss.text();
        const m = txt.match(/<title>([^<]+)<\/title>/);
        const title = m ? m[1] : null;
        return NextResponse.json({ channelId: ch, channelTitle: title });
      }
    } catch (e) {}
    return NextResponse.json({ channelId: ch });
  }

  // If it's a Youtube URL, try fetch and extract channelId from HTML
  let targetUrl = input;
  if (!/^https?:\/\//.test(input)) {
    // Allow inputs like youtube.com/user/xxx
    if (input.startsWith('www.')) targetUrl = 'https://' + input;
    else if (input.includes('youtube.com')) targetUrl = 'https://' + input;
  }

  try {
    const res = await fetch(targetUrl, { redirect: 'follow' });
    if (!res.ok) return NextResponse.json({ error: 'fetch_failed', status: res.status }, { status: 502 });
    const text = await res.text();
    // try to find "channelId":"UC..."
    const m = text.match(/"channelId"\s*:\s*"(UC[0-9A-Za-z_-]{20,})"/);
    if (m) return NextResponse.json({ channelId: m[1] });

    // fallback: look for "externalId":"UC..."
    const m2 = text.match(/"externalId"\s*:\s*"(UC[0-9A-Za-z_-]{20,})"/);
    if (m2) return NextResponse.json({ channelId: m2[1] });

    // If not found, return not found
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ error: 'fetch_error', message: String(err) }, { status: 502 });
  }
}

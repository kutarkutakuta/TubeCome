import { NextResponse } from 'next/server';

async function fetchChannelTitleFromRss(channelId: string) {
  try {
    const rss = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    if (rss.ok) {
      const txt = await rss.text();
      const m = txt.match(/<title>([^<]+)<\/title>/);
      const titleRaw = m ? m[1] : null;
      try {
        const { decodeHtml } = await import('@/utils/html');
        const title = titleRaw ? decodeHtml(titleRaw) : null;
        return title;
      } catch (e) {
        return titleRaw;
      }
    }
  } catch (e) {}
  return null;
}

function decodeHtmlEntities(str: string) {
  return str.replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const input = (body.input || '').trim();
  if (!input) return NextResponse.json({ error: 'missing_input' }, { status: 400 });

  // UCで始まるチャンネルIDが含まれる場合
  const idMatch = input.match(/^(UC[0-9A-Za-z_-]{20,})$/);
  if (idMatch) {
    const channelId = idMatch[1];
    const channelTitle = await fetchChannelTitleFromRss(channelId);
    if (channelTitle) {
      return NextResponse.json({ channelId, channelTitle });
    }
    return NextResponse.json({ channelId });
  }

  // URLが与えられた場合はクローリング
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

    let channelId: string | null = null;
    
    // 正規表現でチャンネルID (UC...) を抽出
    const regex = /"browseId":"(UC[a-zA-Z0-9_-]{22})"/;
    const match = text.match(regex);
    channelId = match ? match[1] : null;
    
    // 予備の抽出方法 (meta property="og:url")
    if (!channelId) {
      const ogUrlRegex = /<meta property="og:url" content="https:\/\/www\.youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})">/;
      const ogMatch = text.match(ogUrlRegex);
      channelId = ogMatch ? ogMatch[1] : null;
    }

    if (channelId) {
      const channelTitle = await fetchChannelTitleFromRss(channelId);
      if (channelTitle) {
        return NextResponse.json({ channelId, channelTitle });
      }
      return NextResponse.json({channelId});
    }

    // If not found, return not found
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ error: 'fetch_error', message: String(err) }, { status: 502 });
  }
}

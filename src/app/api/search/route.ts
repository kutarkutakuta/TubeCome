import { NextResponse } from 'next/server';

// Simple proxy to Meilisearch index. Requires MEILI_HOST and optionally MEILI_KEY env vars.
// Query params:
//  - q: query text
//  - type: "channels" or "videos" (default: videos)

const MEILI_HOST = process.env.MEILI_HOST || 'http://127.0.0.1:7700';
const MEILI_KEY = process.env.MEILI_KEY || '';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const type = url.searchParams.get('type') || 'videos';
  const index = type === 'channels' ? 'channels' : 'videos';

  if (!q) return NextResponse.json({ results: [] });

  const meiliUrl = `${MEILI_HOST}/indexes/${encodeURIComponent(index)}/search`;
  const body = JSON.stringify({ q, limit: 20 });

  try {
    const res = await fetch(meiliUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(MEILI_KEY ? { Authorization: `Bearer ${MEILI_KEY}` } : {}),
      },
      body,
    });
    if (!res.ok) return NextResponse.json({ error: 'meili_error', status: res.status }, { status: 502 });
    const json = await res.json();
    return NextResponse.json({ results: json.hits });
  } catch (err: any) {
    return NextResponse.json({ error: 'unavailable', message: err?.message ?? String(err) }, { status: 503 });
  }
}

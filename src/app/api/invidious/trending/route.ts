import { NextResponse } from 'next/server';

const INSTANCES = (process.env.INVIDIOUS_INSTANCES || 'https://yewtu.cafe,https://yewtu.eu').split(',');
const CACHE_TTL = Number(process.env.INVIDIOUS_CACHE_TTL || 60 * 5); // 秒
const cache = new Map<string, { ts: number; body: any }>();

async function fetchFromInstance(instance: string) {
  const r = await fetch(instance + '/api/v1/trending');
  if (!r.ok) throw new Error('bad_instance');
  return r.json();
}

export async function GET() {
  const key = 'trending:primary';
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.ts) / 1000 < CACHE_TTL) {
    return NextResponse.json(cached.body);
  }

  for (const inst of INSTANCES) {
    try {
      const body = await fetchFromInstance(inst);
      cache.set(key, { ts: Date.now(), body });
      return NextResponse.json(body);
    } catch (err) {
      // try next instance
    }
  }

  // フォールバック（空配列など）
  return NextResponse.json({ error: 'unavailable', items: [] }, { status: 503 });
}

import { NextResponse } from 'next/server';
import { getVideoStatistics } from '@/lib/youtube';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const idsParam = url.searchParams.get('ids');
    if (!idsParam) return NextResponse.json({ error: 'ids required' }, { status: 400 });

    const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length === 0) return NextResponse.json({ error: 'ids required' }, { status: 400 });
    if (ids.length > 50) return NextResponse.json({ error: 'max 50 ids' }, { status: 400 });

    const stats = await getVideoStatistics(ids);
    return NextResponse.json({ stats });
  } catch (err) {
    console.error('video-stats route error:', err);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}

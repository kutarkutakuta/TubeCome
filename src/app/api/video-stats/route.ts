import { NextResponse } from 'next/server';
import { getVideoStatistics } from '@/lib/youtube';
import { getDailyQuotaTotalByIp } from '@/utils/supabase/serverClient';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const idsParam = url.searchParams.get('ids');
    if (!idsParam) return NextResponse.json({ error: 'ids required' }, { status: 400 });

    const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length === 0) return NextResponse.json({ error: 'ids required' }, { status: 400 });
    if (ids.length > 50) return NextResponse.json({ error: 'max 50 ids' }, { status: 400 });

    // Note: IP is now automatically extracted inside logYouTubeQuota
    // Pre-check per-IP error threshold to avoid servicing obviously blocked clients
    // Extract IP for the pre-check only
    const ipHeader = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || undefined;
    let clientIp = ipHeader ? ipHeader.split(',')[0].trim() : undefined;
    
    if (clientIp) {
      const total = await getDailyQuotaTotalByIp(clientIp);
      const errorThreshold = parseInt(process.env.YT_QUOTA_ERROR_PER_IP || '5000', 10);
      if (total >= errorThreshold) {
        console.error('Rejecting video-stats request due to exceeded quota for IP', clientIp, total, errorThreshold);
        return NextResponse.json({ error: 'quota exceeded' }, { status: 429 });
      }
    }

    const stats = await getVideoStatistics(ids);
    return NextResponse.json({ stats });
  } catch (err) {
    console.error('video-stats route error:', err);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}

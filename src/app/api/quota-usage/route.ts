import { NextResponse } from 'next/server';
import { getDailyQuotaTotalByIp } from '@/utils/supabase/serverClient';

export async function GET(req: Request) {
  try {
    const ipHeader = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || undefined;
    let clientIp = ipHeader ? ipHeader.split(',')[0].trim() : undefined;

    if (!clientIp) {
      return NextResponse.json({ error: 'no-ip' }, { status: 400 });
    }

    const total = await getDailyQuotaTotalByIp(clientIp);
    const warnThreshold = parseInt(process.env.YT_QUOTA_WARN_PER_IP || '1000', 10);
    const errorThreshold = parseInt(process.env.YT_QUOTA_ERROR_PER_IP || '5000', 10);

    // log for debugging
    console.log('quota-usage called; clientIp=', clientIp, 'total=', total);
    return NextResponse.json({ total, warnThreshold, errorThreshold, clientIp: process.env.NODE_ENV === 'development' ? clientIp : undefined });
  } catch (err) {
    console.error('quota-usage route error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
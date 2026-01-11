import { NextResponse } from 'next/server';
import { getDailyQuotaTotalByIp, getDailyQuotaTotalGlobal } from '@/utils/supabase/serverClient';

export async function GET(req: Request) {
  try {
    const ipHeader = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || undefined;
    let clientIp = ipHeader ? ipHeader.split(',')[0].trim() : undefined;

    if (!clientIp) {
      return NextResponse.json({ error: 'no-ip' }, { status: 400 });
    }

    const total = await getDailyQuotaTotalByIp(clientIp);
    const globalTotal = await getDailyQuotaTotalGlobal();
    const warnThreshold = parseInt(process.env.YT_QUOTA_WARN_PER_IP || '100', 10);
    const errorThreshold = parseInt(process.env.YT_QUOTA_ERROR_PER_IP || '200', 10);
    const globalErrorThreshold = parseInt(process.env.YT_QUOTA_ERROR_GLOBAL || '10000', 10);

    // log for debugging
    console.log('quota-usage called; clientIp=', clientIp, 'total=', total, 'globalTotal=', globalTotal);
    return NextResponse.json({ 
      total, 
      globalTotal,
      warnThreshold, 
      errorThreshold, 
      globalErrorThreshold,
      clientIp: process.env.NODE_ENV === 'development' ? clientIp : undefined 
    });
  } catch (err) {
    console.error('quota-usage route error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
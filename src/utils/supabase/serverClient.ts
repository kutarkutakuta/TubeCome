import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
} else {
  console.warn('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL not set; quota logging will be no-op');
}

export async function logYouTubeQuota(type: string, units = 1, details?: Record<string, any>, clientIp?: string) {
  if (!supabaseAdmin) return { status: 'noop' as const };

  try {
    // Extract client IP from headers if not provided
    let ip = clientIp;
    if (!ip) {
      try {
        const headersList = await headers();
        ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
          || headersList.get('x-real-ip')
          || headersList.get('cf-connecting-ip')
          || undefined;
      } catch (e) {
        // headers() may fail in some contexts (e.g., static generation)
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    await (supabaseAdmin as any).from('youtube_quota_logs').insert({ date: today, type, units, details, client_ip: ip ?? null });

    // If IP is available, compute today's total and evaluate thresholds
    if (ip) {
      const { data, error } = await (supabaseAdmin as any)
        .from('youtube_quota_logs')
        .select('units')
        .eq('date', today)
        .eq('client_ip', ip);

      if (error) {
        console.error('Failed to read quota total for IP:', error);
        return { status: 'logged' as const };
      }

      const total = (data || []).reduce((s: number, r: any) => s + (r?.units || 0), 0);
      const warnThreshold = parseInt(process.env.YT_QUOTA_WARN_PER_IP || '1000', 10);
      const errorThreshold = parseInt(process.env.YT_QUOTA_ERROR_PER_IP || '5000', 10);

      if (total >= errorThreshold) {
        // insert an error marker
        try {
          await (supabaseAdmin as any).from('youtube_quota_logs').insert({ date: today, type: 'quota.error', units: 0, details: { ip, total, threshold: errorThreshold }, client_ip: ip });
        } catch (e) {
          console.error('Failed to insert quota.error marker:', e);
        }
        console.error('YouTube quota ERROR threshold exceeded', { clientIp: ip, total, threshold: errorThreshold });
        return { status: 'error' as const, total, threshold: errorThreshold };
      }

      if (total >= warnThreshold) {
        // insert a warning marker
        try {
          await (supabaseAdmin as any).from('youtube_quota_logs').insert({ date: today, type: 'quota.warn', units: 0, details: { ip, total, threshold: warnThreshold }, client_ip: ip });
        } catch (e) {
          console.error('Failed to insert quota.warn marker:', e);
        }
        console.warn('YouTube quota WARNING threshold exceeded', { clientIp: ip, total, threshold: warnThreshold });
        return { status: 'warn' as const, total, threshold: warnThreshold };
      }

      return { status: 'ok' as const, total };
    }

    return { status: 'logged' as const };
  } catch (err) {
    console.error('Failed to log YouTube quota to Supabase:', err);
    return { status: 'error' as const, reason: String(err) };
  }
}

export async function getDailyQuotaTotalByIp(clientIp: string) {
  if (!supabaseAdmin) return 0;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await (supabaseAdmin as any)
      .from('youtube_quota_logs')
      .select('units')
      .eq('date', today)
      .eq('client_ip', clientIp);

    if (error) {
      console.error('Failed to read quota total for IP:', error);
      return 0;
    }

    return (data || []).reduce((s: number, r: any) => s + (r?.units || 0), 0);
  } catch (err) {
    console.error('Failed to getDailyQuotaTotalByIp:', err);
    return 0;
  }
}

export { supabaseAdmin };

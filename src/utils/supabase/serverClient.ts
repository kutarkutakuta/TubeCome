import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
} else {
  console.warn('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL not set; quota logging will be no-op');
}

export async function logYouTubeQuota(type: string, units = 1, details?: Record<string, any>) {
  if (!supabaseAdmin) return;

  try {
    const today = new Date().toISOString().slice(0, 10);
    // Use `any` to avoid client table typing issues in this repo setup
    await (supabaseAdmin as any).from('youtube_quota_logs').insert({ date: today, type, units, details });
  } catch (err) {
    console.error('Failed to log YouTube quota to Supabase:', err);
  }
}

export { supabaseAdmin };

import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

import { randomUUID } from 'crypto';

function getClientIdFromReq(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|; )tubecome_client_id=([^;]+)/);
  return match ? match[1] : null;
}

function makeCookieResponse(data: any, clientId?: string) {
  const res = NextResponse.json(data);
  if (clientId) {
    res.cookies.set('tubecome_client_id', clientId, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 365 });
  }
  return res;
}

// Helper to ensure a client id exists
async function ensureClientId(req: Request) {
  let clientId = getClientIdFromReq(req);
  if (!clientId) {
    // use Node's crypto.randomUUID for server safety
    clientId = randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
  }
  return clientId;
}

export async function GET(req: Request) {
  // list favorites
  const clientId = getClientIdFromReq(req);
  if (!clientId) {
    // no cookie, return empty and set cookie for future
    const newId = await ensureClientId(req);
    return makeCookieResponse({ favorites: [] }, String(newId));
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('channel_id,channel_title,created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'db_error', details: error.message }, { status: 500 });
  }
  return NextResponse.json({ favorites: data });
}

export async function POST(req: Request) {
  // add favorite
  const body = await req.json().catch(() => ({}));
  const { channelId, channelTitle } = body || {};
  if (!channelId) return NextResponse.json({ error: 'missing_channelId' }, { status: 400 });

  const clientId = await ensureClientId(req);

  const payload = { client_id: clientId, channel_id: channelId, channel_title: channelTitle };
  const { error } = await supabase.from('favorites').upsert(payload);
  if (error) return makeCookieResponse({ error: 'db_error', details: error.message }, String(clientId));

  return makeCookieResponse({ ok: true, favorite: payload }, String(clientId));
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const channelId = url.searchParams.get('channelId');
  if (!channelId) return NextResponse.json({ error: 'missing_channelId' }, { status: 400 });

  const clientId = getClientIdFromReq(req);
  if (!clientId) return NextResponse.json({ ok: true });

  const { error } = await supabase.from('favorites').delete().match({ client_id: clientId, channel_id: channelId });
  if (error) return NextResponse.json({ error: 'db_error', details: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  let text = '';
  let url = '';

  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    text = (form.get('text') as string) || '';
    url = (form.get('url') as string) || '';
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    const body = await req.text();
    const params = new URLSearchParams(body);
    text = params.get('text') || '';
    url = params.get('url') || '';
  } else if (contentType.includes('application/json')) {
    const json = await req.json();
    text = json?.text || '';
    url = json?.url || '';
  }

  const input = url || text || '';
  const target = new URL(req.nextUrl.origin);
  target.pathname = '/';
  if (input) target.searchParams.set('input', input);

  return NextResponse.redirect(target.toString(), 302);
}

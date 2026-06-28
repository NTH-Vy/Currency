import { NextResponse } from 'next/server';

const BACKEND = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = url.searchParams.get('page') || '1';
    const backendRes = await fetch(`${BACKEND}/api/news?page=${page}`, { cache: 'no-store' });
    const body = await backendRes.arrayBuffer();
    const headers: Record<string, string> = {};
    const contentType = backendRes.headers.get('content-type');
    if (contentType) headers['content-type'] = contentType;
    return new NextResponse(Buffer.from(body), { status: backendRes.status, headers });
  } catch (err) {
    return NextResponse.json({ error: 'proxy_error', detail: String(err) }, { status: 502 });
  }
}

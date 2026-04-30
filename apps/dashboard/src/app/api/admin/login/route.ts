import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE = 'nova_admin';
const ONE_DAY = 60 * 60 * 24;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json(
      { error: 'Admin access is not configured on the server.' },
      { status: 500 },
    );
  }

  const body = (await req.json().catch(() => null)) as { secret?: string } | null;
  const secret = body?.secret ?? '';

  if (!secret || !timingSafeEqual(secret, adminSecret)) {
    return NextResponse.json({ error: 'Invalid admin secret.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_DAY,
  });
  return res;
}

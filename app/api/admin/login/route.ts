import { NextResponse } from 'next/server';
import { COOKIE_NAME, MAX_AGE_SECONDS, signSession, timingSafeEqualStr } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const password = body && typeof body === 'object' ? (body as Record<string, unknown>).password : undefined;

  const expected = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!expected || !secret) {
    return NextResponse.json(
      { error: 'Admin auth is not configured on the server (ADMIN_PASSWORD / ADMIN_SESSION_SECRET missing).' },
      { status: 500 },
    );
  }

  if (typeof password !== 'string' || !timingSafeEqualStr(password, expected)) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const token = await signSession(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE_SECONDS,
    path: '/',
  });
  return res;
}

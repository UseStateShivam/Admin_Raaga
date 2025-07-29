// app/api/login/route.ts
import { NextResponse } from 'next/server';
import supabase from '@/lib/utils/supabaseClient';

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return NextResponse.json({ success: false, error: error?.message || 'Login failed' }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });

  res.cookies.set('token', data.session.access_token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return res;
}

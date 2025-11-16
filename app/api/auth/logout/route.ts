/**
 * User logout endpoint
 * POST /api/auth/logout
 * Clears the session cookie
 */

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Çıkış başarılı',
  });

  // Clear the session cookie
  response.cookies.set('mespod_session', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}

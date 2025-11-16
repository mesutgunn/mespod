/**
 * User login endpoint
 * POST /api/auth/login
 * Validates credentials and sets JWT cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth/jwt';
import type { AuthLoginRequest, AuthLoginResponse } from '@/types/mespod';

export async function POST(request: NextRequest) {
  try {
    const body: AuthLoginRequest = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email ve şifre gereklidir' } as AuthLoginResponse,
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email veya şifre hatalı' } as AuthLoginResponse,
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Email veya şifre hatalı' } as AuthLoginResponse,
        { status: 401 }
      );
    }

    // Create JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: 'Giriş başarılı',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    } as AuthLoginResponse);

    // Set httpOnly cookie
    response.cookies.set('mespod_session', token, {
      httpOnly: true,
      secure: true, // Always true for HTTPS (Netlify)
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Giriş sırasında bir hata oluştu' } as AuthLoginResponse,
      { status: 500 }
    );
  }
}

/**
 * User registration endpoint
 * POST /api/auth/register
 * Creates new user with hashed password
 * First user automatically becomes ADMIN
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import type { AuthRegisterRequest, AuthRegisterResponse } from '@/types/mespod';

export async function POST(request: NextRequest) {
  try {
    const body: AuthRegisterRequest = await request.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email ve şifre gereklidir' } as AuthRegisterResponse,
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Bu email zaten kullanılıyor' } as AuthRegisterResponse,
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if this is the first user (will be ADMIN)
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'ADMIN' : 'USER';

    // Create user
    await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
        role,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Kayıt başarılı! Giriş yapabilirsiniz.',
    } as AuthRegisterResponse);
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Kayıt sırasında bir hata oluştu' } as AuthRegisterResponse,
      { status: 500 }
    );
  }
}

/**
 * Get current authenticated user from request
 * Reads JWT from cookie and validates it
 */

import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { prisma } from '@/lib/prisma';

export interface CurrentUser {
  id: string;
  email: string;
  role: string;
  name: string | null;
}

/**
 * Retrieves the current authenticated user from the request cookie
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('mespod_session')?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    // Fetch user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

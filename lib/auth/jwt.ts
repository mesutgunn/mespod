/**
 * JWT token utilities for authentication
 * Handles token signing and verification using jsonwebtoken
 */

import jwt from 'jsonwebtoken';

const AUTH_SECRET = process.env.AUTH_SECRET || 'fallback-secret-key';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Signs a JWT token with user payload
 * @param payload - User data to encode in token
 * @returns Signed JWT token string
 */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, AUTH_SECRET, {
    expiresIn: '7d', // Token valid for 7 days
  });
}

/**
 * Verifies and decodes a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

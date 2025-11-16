/**
 * Design generation endpoint
 * POST /api/mespod/design
 * Proxies request to n8n webhook for AI design variant generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateDesignVariants } from '@/lib/n8n/design';
import type { DesignRequest } from '@/types/mespod';

export async function POST(request: NextRequest) {
  try {
    const body: DesignRequest = await request.json();

    if (!body.baseImageUrl) {
      return NextResponse.json(
        { error: 'Base image URL gereklidir' },
        { status: 400 }
      );
    }

    const result = await generateDesignVariants(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Design generation error:', error);
    return NextResponse.json(
      { error: 'Tasarım üretilirken hata oluştu' },
      { status: 500 }
    );
  }
}

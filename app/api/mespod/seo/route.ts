/**
 * SEO content generation endpoint
 * POST /api/mespod/seo
 * Proxies request to n8n webhook for Etsy-optimized SEO content
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSeoContent } from '@/lib/n8n/seo';
import type { SeoRequest } from '@/types/mespod';

export async function POST(request: NextRequest) {
  try {
    const body: SeoRequest = await request.json();

    if (!body.baseTitle || !body.baseDescription || !body.baseTags) {
      return NextResponse.json(
        { error: 'Base title, description ve tags gereklidir' },
        { status: 400 }
      );
    }

    const result = await generateSeoContent(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('SEO generation error:', error);
    return NextResponse.json(
      { error: 'SEO içeriği üretilirken hata oluştu' },
      { status: 500 }
    );
  }
}

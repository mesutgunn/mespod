/**
 * Etsy product scraper endpoint
 * POST /api/mespod/etsy
 * Proxies request to n8n webhook for Etsy product analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { scrapeEtsyProduct } from '@/lib/n8n/etsy';
import type { EtsyRequest } from '@/types/mespod';

export async function POST(request: NextRequest) {
  try {
    const body: EtsyRequest = await request.json();

    if (!body.url) {
      return NextResponse.json(
        { error: 'Etsy ürün URL\'i gereklidir' },
        { status: 400 }
      );
    }

    const result = await scrapeEtsyProduct(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Etsy scraping error:', error);
    return NextResponse.json(
      { error: 'Etsy ürün bilgisi alınırken hata oluştu' },
      { status: 500 }
    );
  }
}

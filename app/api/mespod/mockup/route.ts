/**
 * Mockup generation endpoint
 * POST /api/mespod/mockup
 * Proxies request to n8n webhook for mockup creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateMockup } from '@/lib/n8n/mockup';
import type { MockupRequest } from '@/types/mespod';

export async function POST(request: NextRequest) {
  try {
    const body: MockupRequest = await request.json();

    if (!body.designImageUrl || !body.mockupTemplateId) {
      return NextResponse.json(
        { error: 'Design image URL ve mockup template ID gereklidir' },
        { status: 400 }
      );
    }

    const result = await generateMockup(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Mockup generation error:', error);
    return NextResponse.json(
      { error: 'Mockup oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}

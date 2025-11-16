/**
 * Project designs management
 * POST /api/projects/[id]/designs - Add design to project
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const { imageUrl, prompt, mockupTemplate, mockupUrl, seoTitle, seoDescription, seoTags } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    }

    const design = await prisma.design.create({
      data: {
        projectId: params.id,
        imageUrl,
        prompt,
        mockupTemplate,
        mockupUrl,
        seoTitle,
        seoDescription,
        seoTags: seoTags || [],
      }
    });

    return NextResponse.json(design);
  } catch (error) {
    console.error('Create design error:', error);
    return NextResponse.json({ error: 'Failed to create design' }, { status: 500 });
  }
}

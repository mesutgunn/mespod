/**
 * User projects management
 * GET /api/projects - Get user's projects
 * POST /api/projects - Create new project
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        designs: true,
        _count: {
          select: { designs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json({ error: 'Failed to get projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { etsyUrl, etsyTitle, etsyDesc, etsyTags } = body;

    if (!etsyUrl) {
      return NextResponse.json({ error: 'Etsy URL required' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        etsyUrl,
        etsyTitle,
        etsyDesc,
        etsyTags: etsyTags || [],
        status: 'processing',
      },
      include: {
        designs: true
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

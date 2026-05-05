import { NextRequest, NextResponse } from 'next/server';
import tagsData from '@/data/tags.json';

const allTags = (tagsData as any).tags || [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const type = searchParams.get('type') || '';

    let filtered = allTags;
    if (type) filtered = filtered.filter((t: any) => t.type === type);

    return NextResponse.json({
      tags: filtered.slice(0, limit),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

let cachedTags: any[] | null = null;

async function getTags(): Promise<any[]> {
  if (cachedTags) return cachedTags;
  const fs = await import('fs');
  const path = await import('path');
  const filePath = path.join(process.cwd(), 'src', 'data', 'tags.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(data);
  cachedTags = parsed.tags || [];
  return cachedTags!;
}

export async function GET(request: NextRequest) {
  try {
    const tags = await getTags();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const type = searchParams.get('type') || '';

    let filtered = tags;
    if (type) filtered = filtered.filter(t => t.type === type);

    return NextResponse.json({
      tags: filtered.slice(0, limit),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

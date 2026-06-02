import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { RevalidateRequestSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = RevalidateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { secret, hospitalId } = parsed.data;

  if (secret !== process.env['REVALIDATE_SECRET']) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  revalidatePath(`/hospitals/${hospitalId}`);

  return NextResponse.json({ revalidated: true, hospitalId });
}

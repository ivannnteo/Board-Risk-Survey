import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  const { count } = await prisma.response.deleteMany({});
  return NextResponse.json({ deleted: count });
}

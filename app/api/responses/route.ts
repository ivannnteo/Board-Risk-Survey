import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RISK_IDS, BARRIER_IDS } from '@/lib/domain';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { topRisks, preparedness, barrier, barrierOther } = body as Record<string, unknown>;

  if (
    !Array.isArray(topRisks) ||
    topRisks.length !== 3 ||
    new Set(topRisks).size !== 3 ||
    !topRisks.every((id) => typeof id === 'string' && RISK_IDS.includes(id))
  ) {
    return NextResponse.json({ error: 'topRisks must be exactly 3 unique valid risk ids.' }, { status: 400 });
  }

  if (typeof preparedness !== 'object' || preparedness === null || Array.isArray(preparedness)) {
    return NextResponse.json({ error: 'preparedness must be an object.' }, { status: 400 });
  }

  const prep = preparedness as Record<string, unknown>;
  const prepKeys = Object.keys(prep);
  if (prepKeys.length !== 3 || !prepKeys.every((k) => (topRisks as string[]).includes(k))) {
    return NextResponse.json({ error: 'preparedness keys must exactly match topRisks.' }, { status: 400 });
  }

  const cleanedPreparedness: Record<string, number[]> = {};
  for (const k of prepKeys) {
    const arr = prep[k];
    if (
      !Array.isArray(arr) ||
      !arr.every((n) => Number.isInteger(n) && n >= 0 && n <= 5) ||
      new Set(arr).size !== arr.length
    ) {
      return NextResponse.json(
        { error: `preparedness["${k}"] must be an array of unique integers between 0 and 5.` },
        { status: 400 },
      );
    }
    cleanedPreparedness[k] = arr as number[];
  }

  if (typeof barrier !== 'string' || !BARRIER_IDS.includes(barrier)) {
    return NextResponse.json({ error: 'Invalid barrier.' }, { status: 400 });
  }

  let cleanBarrierOther: string | null = null;
  if (barrier === 'others') {
    if (typeof barrierOther !== 'string' || !barrierOther.trim()) {
      return NextResponse.json({ error: 'barrierOther is required when barrier is "others".' }, { status: 400 });
    }
    cleanBarrierOther = barrierOther.trim().slice(0, 500);
  }

  const created = await prisma.response.create({
    data: {
      topRisks: topRisks as string[],
      preparedness: cleanedPreparedness,
      barrier,
      barrierOther: cleanBarrierOther,
    },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RISKS, BARRIERS, RATINGS, getPreparednessInfo } from '@/lib/domain';

export const dynamic = 'force-dynamic';

export async function GET() {
  const responses = await prisma.response.findMany();

  // Question 1 - risk selection frequency, all 10 categories.
  const riskCounts: Record<string, number> = {};
  RISKS.forEach((r) => {
    riskCounts[r.id] = 0;
  });
  responses.forEach((r) => {
    r.topRisks.forEach((id) => {
      if (id in riskCounts) riskCounts[id]++;
    });
  });
  const riskFrequency = RISKS.map((r) => ({
    id: r.id,
    label: r.label,
    short: r.short,
    color: r.color,
    value: riskCounts[r.id],
  })).sort((a, b) => b.value - a.value);

  // Preparedness Index distribution, broken down per one of the overall top-3 most-selected risks.
  const top3Ids = riskFrequency.slice(0, 3).map((r) => r.id);
  const top3PreparednessByRisk = top3Ids.map((riskId) => {
    const risk = RISKS.find((r) => r.id === riskId)!;
    const bucketCounts: Record<string, number> = {};
    RATINGS.forEach((rating) => {
      bucketCounts[rating] = 0;
    });
    responses.forEach((r) => {
      if (!r.topRisks.includes(riskId)) return;
      const prep = (r.preparedness ?? {}) as unknown as Record<string, number[]>;
      const { rating } = getPreparednessInfo(prep[riskId]);
      bucketCounts[rating]++;
    });
    return {
      id: risk.id,
      label: risk.label,
      short: risk.short,
      color: risk.color,
      distribution: RATINGS.map((name) => ({ name, value: bucketCounts[name] })),
    };
  });

  // Question 3 - biggest barrier frequency (bonus card).
  const barrierCounts: Record<string, number> = {};
  const barrierEntries: Record<string, string[]> = {};
  BARRIERS.forEach((b) => {
    barrierCounts[b.id] = 0;
    barrierEntries[b.id] = [];
  });
  responses.forEach((r) => {
    if (r.barrier in barrierCounts) barrierCounts[r.barrier]++;
    if (r.barrierOther?.trim()) barrierEntries[r.barrier]?.push(r.barrierOther.trim());
  });
  const barrierFrequency = BARRIERS.map((b) => ({
    id: b.id,
    label: b.label,
    value: barrierCounts[b.id],
    entries: barrierEntries[b.id],
  })).sort((a, b) => b.value - a.value);

  return NextResponse.json({
    totalResponses: responses.length,
    riskFrequency,
    top3Ids,
    top3PreparednessByRisk,
    barrierFrequency,
  });
}

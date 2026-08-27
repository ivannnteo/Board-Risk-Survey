import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { prisma } from '@/lib/prisma';
import { RISKS, BARRIERS, getPreparednessInfo } from '@/lib/domain';

export const dynamic = 'force-dynamic';

export async function GET() {
  const responses = await prisma.response.findMany({ orderBy: { createdAt: 'asc' } });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Responses');

  sheet.columns = [
    { header: 'Response ID', key: 'id', width: 38 },
    { header: 'Submitted At', key: 'createdAt', width: 22 },
    { header: 'Risk 1', key: 'risk1', width: 28 },
    { header: 'Risk 1 %', key: 'risk1Pct', width: 10 },
    { header: 'Risk 1 Rating', key: 'risk1Rating', width: 18 },
    { header: 'Risk 2', key: 'risk2', width: 28 },
    { header: 'Risk 2 %', key: 'risk2Pct', width: 10 },
    { header: 'Risk 2 Rating', key: 'risk2Rating', width: 18 },
    { header: 'Risk 3', key: 'risk3', width: 28 },
    { header: 'Risk 3 %', key: 'risk3Pct', width: 10 },
    { header: 'Risk 3 Rating', key: 'risk3Rating', width: 18 },
    { header: 'Biggest Barrier', key: 'barrier', width: 40 },
    { header: 'Barrier — Other (free text)', key: 'barrierOther', width: 40 },
  ];
  sheet.getRow(1).font = { bold: true };

  responses.forEach((r) => {
    const prep = (r.preparedness ?? {}) as unknown as Record<string, number[]>;
    const barrierLabel = BARRIERS.find((b) => b.id === r.barrier)?.label ?? r.barrier;
    const row: Record<string, string | number> = {
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      barrier: barrierLabel,
      barrierOther: r.barrierOther ?? '',
    };
    r.topRisks.forEach((riskId, i) => {
      const risk = RISKS.find((rk) => rk.id === riskId);
      const info = getPreparednessInfo(prep[riskId]);
      row[`risk${i + 1}`] = risk?.label ?? riskId;
      row[`risk${i + 1}Pct`] = info.pct;
      row[`risk${i + 1}Rating`] = info.rating;
    });
    sheet.addRow(row);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `board-risk-survey-responses-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

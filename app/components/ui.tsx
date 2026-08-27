'use client';

import type { ReactNode } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
} from 'recharts';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { COLORS } from '@/lib/theme';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function ProgressHeader({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <div className="mb-7">
      <div className="flex justify-between items-baseline mb-2">
        <span style={{ color: COLORS.ink }} className="font-serif text-sm">
          {label}
        </span>
        <span style={{ color: COLORS.brass }} className="font-serif text-xs tracking-widest">
          {pad(step)} / {pad(total)}
        </span>
      </div>
      <div style={{ backgroundColor: COLORS.line }} className="w-full h-0.5 relative overflow-hidden">
        <div
          style={{ backgroundColor: COLORS.brass, width: `${(step / total) * 100}%` }}
          className="h-full absolute left-0 top-0 transition-all duration-300"
        />
      </div>
    </div>
  );
}

export function Row({
  selected,
  onClick,
  children,
  indicator,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  indicator?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        borderColor: selected ? COLORS.ledger : COLORS.line,
        borderLeftColor: selected ? COLORS.brass : COLORS.line,
        borderLeftWidth: selected ? '4px' : '1px',
        backgroundColor: selected ? COLORS.tint : COLORS.white,
        opacity: disabled ? 0.45 : 1,
      }}
      className="w-full text-left px-4 py-3.5 border rounded-sm transition-colors flex items-center gap-3"
    >
      {indicator}
      <span style={{ color: COLORS.ink }} className="flex-1 text-sm">
        {children}
      </span>
      {!indicator && selected && <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: COLORS.ledger }} />}
    </button>
  );
}

export function NavButtons({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = 'Continue',
  loading,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex justify-between items-center pt-2">
      <button onClick={onBack} style={{ color: COLORS.muted }} className="px-3 py-2.5 font-medium flex items-center gap-1 text-sm">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled || loading}
        style={{ backgroundColor: nextDisabled || loading ? COLORS.disabled : COLORS.ledger, color: COLORS.white }}
        className="px-6 py-3 rounded-sm font-semibold flex items-center gap-2 transition-colors text-sm"
      >
        {loading ? 'Saving…' : nextLabel} {!loading && <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );
}

export function Card({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div style={{ borderColor: COLORS.line, backgroundColor: COLORS.white }} className={`border rounded-sm p-5 ${wide ? 'md:col-span-2' : ''}`}>
      {children}
    </div>
  );
}

export type ChartDatum = { name: string; value: number; color?: string; details?: string[] };

export function PieBlock({ data, stacked }: { data: ChartDatum[]; stacked?: boolean }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <p style={{ color: COLORS.muted }} className="text-sm text-center py-10">
        No data yet.
      </p>
    );
  }
  return (
    <div className={`flex flex-col items-center gap-4 ${stacked ? '' : 'sm:flex-row'}`}>
      <div className={`w-full flex-shrink-0 ${stacked ? '' : 'sm:w-48'}`}>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={78} paddingAngle={2} stroke="none">
              {data.map((d, i) => (
                <Cell key={i} fill={d.color ?? COLORS.ledger} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 w-full space-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between text-sm gap-2">
            <span style={{ color: COLORS.ink }} className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color ?? COLORS.ledger }} />
              <span className="truncate">{d.name}</span>
            </span>
            <span style={{ color: COLORS.muted }} className="font-medium flex-shrink-0">
              {d.value} ({Math.round((d.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function wrapLabel(text: string, maxCharsPerLine = 26): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxCharsPerLine && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function BarDetailsTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartDatum }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{ borderColor: COLORS.line, backgroundColor: COLORS.white }}
      className="border rounded-sm px-3 py-2 shadow-sm max-w-xs"
    >
      <p style={{ color: COLORS.ink }} className="text-xs font-semibold mb-1">
        {d.name} — {d.value}
      </p>
      {d.details && d.details.length > 0 && (
        <ul className="space-y-1 mt-1.5 pt-1.5 border-t" style={{ borderColor: COLORS.line }}>
          {d.details.map((text, i) => (
            <li key={i} style={{ color: COLORS.muted }} className="text-xs leading-snug">
              &ldquo;{text}&rdquo;
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WrappingYAxisTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const lines = wrapLabel(payload?.value ?? '');
  const lineHeight = 13;
  const startY = (y ?? 0) - ((lines.length - 1) * lineHeight) / 2;
  return (
    <text x={x} y={startY} textAnchor="end" fontSize={11} fill={COLORS.ink}>
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

export function BarBlock({
  data,
  barColor = COLORS.ledger,
  fullLabels,
  axisWidth = 160,
}: {
  data: ChartDatum[];
  barColor?: string;
  fullLabels?: boolean;
  axisWidth?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <p style={{ color: COLORS.muted }} className="text-sm text-center py-10">
        No data yet.
      </p>
    );
  }
  const rowHeight = fullLabels ? 52 : 38;
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * rowHeight)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS.line} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: COLORS.muted }} />
        <YAxis
          type="category"
          dataKey="name"
          width={axisWidth}
          tick={fullLabels ? <WrappingYAxisTick /> : { fontSize: 11, fill: COLORS.ink }}
          tickFormatter={fullLabels ? undefined : (v: string) => (v.length > 24 ? v.slice(0, 24) + '…' : v)}
          interval={0}
        />
        <Tooltip content={<BarDetailsTooltip />} />
        <Bar dataKey="value" radius={[0, 2, 2, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? barColor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ColumnBlock({ data, barColor = COLORS.ledger }: { data: ChartDatum[]; barColor?: string }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <p style={{ color: COLORS.muted }} className="text-sm text-center py-10">
        No data yet.
      </p>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.line} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: COLORS.ink }}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: COLORS.muted }} />
        <Tooltip />
        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? barColor} />
          ))}
          <LabelList dataKey="value" position="top" style={{ fontSize: 11, fill: COLORS.muted }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

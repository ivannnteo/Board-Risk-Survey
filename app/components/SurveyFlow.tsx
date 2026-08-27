'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, CheckCircle2, BarChart3 } from 'lucide-react';
import { RISKS, BARRIERS, getPreparednessInfo, RATING_COLORS } from '@/lib/domain';
import { COLORS } from '@/lib/theme';
import { Row, NavButtons, ProgressHeader } from './ui';

type Stage = 'landing' | 'q1' | 'q2' | 'q3' | 'results';

type Selection = number | 'none';

const TOTAL_STEPS = 5; // Q1 (1) + Q2 x3 (2-4) + Q3 (5)

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function SurveyFlow() {
  const [stage, setStage] = useState<Stage>('landing');
  const [topRisks, setTopRisks] = useState<string[]>([]);
  const [preparedness, setPreparedness] = useState<Record<string, Selection[]>>({});
  const [q2Index, setQ2Index] = useState(0);
  const [barrier, setBarrier] = useState<string | null>(null);
  const [barrierOther, setBarrierOther] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const inputStyle = { borderColor: COLORS.line, color: COLORS.ink };

  function toggleRisk(id: string) {
    setTopRisks((prev) => {
      if (prev.includes(id)) return prev.filter((r) => r !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  function toggleAction(riskId: string, idx: Selection) {
    setPreparedness((prev) => {
      const cur = prev[riskId] ?? [];
      let next: Selection[];
      if (idx === 'none') {
        next = cur.includes('none') ? [] : ['none'];
      } else {
        const withoutNone = cur.filter((a) => a !== 'none');
        next = withoutNone.includes(idx) ? withoutNone.filter((a) => a !== idx) : [...withoutNone, idx];
      }
      return { ...prev, [riskId]: next };
    });
  }

  function cleanSelections(riskId: string): number[] {
    return (preparedness[riskId] ?? []).filter((a): a is number => a !== 'none');
  }

  function reset() {
    setTopRisks([]);
    setPreparedness({});
    setQ2Index(0);
    setBarrier(null);
    setBarrierOther('');
    setSubmitError(null);
    setStage('landing');
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    const cleanedPreparedness: Record<string, number[]> = {};
    topRisks.forEach((id) => {
      cleanedPreparedness[id] = cleanSelections(id);
    });
    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topRisks,
          preparedness: cleanedPreparedness,
          barrier,
          barrierOther: barrier === 'others' ? barrierOther : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong saving your response.');
      }
      setStage('results');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong saving your response.');
    } finally {
      setSubmitting(false);
    }
  }

  if (stage === 'landing') {
    return (
      <div className="text-center py-6">
        <h1 style={{ color: COLORS.ink }} className="font-serif text-2xl sm:text-3xl font-bold mb-4">
          How Prepared Is Your Organisation?
        </h1>
        <p style={{ color: COLORS.muted }} className="max-w-md mx-auto mb-6 leading-relaxed text-sm sm:text-base">
          Rank your organisation&apos;s top 3 risks, tell us what you&apos;ve done to prepare for them, and see an
          instant preparedness reading.
        </p>
        <div className="flex justify-center gap-1 mb-2">
          {RISKS.map((r) => (
            <div key={r.id} style={{ backgroundColor: r.color }} className="w-4 h-1.5" />
          ))}
        </div>
        <p style={{ color: COLORS.muted }} className="text-xs uppercase tracking-widest mb-8">
          10 risk categories assessed
        </p>
        <button
          onClick={() => setStage('q1')}
          style={{ backgroundColor: COLORS.ledger, color: COLORS.white }}
          className="px-8 py-3.5 rounded-sm font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2 mb-4"
        >
          Begin the Assessment <ChevronRight className="w-4 h-4" />
        </button>
        <div>
          <Link
            href="/admin/login"
            style={{ color: COLORS.ledger }}
            className="text-sm font-medium underline decoration-dotted underline-offset-4 inline-flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" /> Admin login
          </Link>
        </div>
      </div>
    );
  }

  if (stage === 'q1') {
    return (
      <div>
        <ProgressHeader step={1} total={TOTAL_STEPS} label="Top Risks" />
        <h2 style={{ color: COLORS.ink }} className="font-serif text-lg sm:text-xl font-bold mb-1">
          What are the TOP 3 risks facing your organisation today?
        </h2>
        <p style={{ color: COLORS.muted }} className="text-sm mb-5">
          Tap in order of importance — your first tap becomes your #1 risk. ({topRisks.length}/3 selected)
        </p>
        <div className="grid sm:grid-cols-2 gap-2.5 mb-8">
          {RISKS.map((risk) => {
            const rank = topRisks.indexOf(risk.id);
            const isSelected = rank !== -1;
            const Icon = risk.icon;
            const disabled = !isSelected && topRisks.length >= 3;
            return (
              <button
                key={risk.id}
                onClick={() => toggleRisk(risk.id)}
                disabled={disabled}
                style={{
                  borderColor: isSelected ? COLORS.ledger : COLORS.line,
                  borderLeftColor: isSelected ? COLORS.brass : COLORS.line,
                  borderLeftWidth: isSelected ? '4px' : '1px',
                  backgroundColor: isSelected ? COLORS.tint : COLORS.white,
                  opacity: disabled ? 0.45 : 1,
                }}
                className="w-full text-left px-4 py-3 border rounded-sm transition-colors flex items-center gap-3"
              >
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-serif text-sm font-bold"
                  style={{ backgroundColor: isSelected ? COLORS.ink : COLORS.tint, color: isSelected ? COLORS.brass : COLORS.muted }}
                >
                  {isSelected ? rank + 1 : <Icon className="w-4 h-4" />}
                </span>
                <span style={{ color: COLORS.ink }} className="flex-1 text-sm font-medium">
                  {risk.label}
                </span>
              </button>
            );
          })}
        </div>
        <NavButtons
          onBack={() => setStage('landing')}
          onNext={() => {
            setQ2Index(0);
            setStage('q2');
          }}
          nextDisabled={topRisks.length !== 3}
        />
      </div>
    );
  }

  if (stage === 'q2') {
    const riskId = topRisks[q2Index];
    const risk = RISKS.find((r) => r.id === riskId);
    if (!risk) return null;
    const selected = preparedness[riskId] ?? [];
    const Icon = risk.icon;
    return (
      <div>
        <ProgressHeader step={2 + q2Index} total={TOTAL_STEPS} label={`Preparedness — Risk ${q2Index + 1} of 3`} />
        <div className="flex items-center gap-3 mb-1">
          <span className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: risk.color }}>
            <Icon className="w-5 h-5" style={{ color: COLORS.white }} />
          </span>
          <h2 style={{ color: COLORS.ink }} className="font-serif text-base sm:text-lg font-bold">
            {risk.label}
          </h2>
        </div>
        <p style={{ color: COLORS.muted }} className="text-sm mb-5">
          Which of the following has your organisation done? Select all that apply.
        </p>
        <div className="space-y-2 mb-2">
          {risk.actions.map((action, idx) => {
            const checked = selected.includes(idx);
            return (
              <Row
                key={idx}
                selected={checked}
                onClick={() => toggleAction(riskId, idx)}
                indicator={
                  <span
                    className="flex-shrink-0 w-4 h-4 border flex items-center justify-center"
                    style={{ borderColor: checked ? COLORS.ledger : COLORS.disabled, backgroundColor: checked ? COLORS.ledger : 'transparent' }}
                  >
                    {checked && <CheckCircle2 className="w-3 h-3" style={{ color: COLORS.white }} />}
                  </span>
                }
              >
                {action}
              </Row>
            );
          })}
        </div>
        <button
          onClick={() => toggleAction(riskId, 'none')}
          style={{ borderColor: selected.includes('none') ? COLORS.muted : COLORS.line, backgroundColor: selected.includes('none') ? COLORS.tint : COLORS.white }}
          className="w-full text-left px-4 py-3.5 border border-dashed rounded-sm transition-colors mb-8"
        >
          <span style={{ color: COLORS.muted }} className="text-sm italic">
            None of the above
          </span>
        </button>
        <NavButtons
          onBack={() => {
            if (q2Index > 0) setQ2Index(q2Index - 1);
            else setStage('q1');
          }}
          onNext={() => {
            if (q2Index < 2) setQ2Index(q2Index + 1);
            else setStage('q3');
          }}
          nextDisabled={selected.length === 0}
        />
      </div>
    );
  }

  if (stage === 'q3') {
    return (
      <div>
        <ProgressHeader step={5} total={TOTAL_STEPS} label="Barriers" />
        <h2 style={{ color: COLORS.ink }} className="font-serif text-lg sm:text-xl font-bold mb-1">
          What do you believe is the biggest barrier preventing organisations from becoming more resilient to
          emerging risks?
        </h2>
        <p style={{ color: COLORS.muted }} className="text-sm mb-5">
          Select one.
        </p>
        <div className="space-y-2 mb-4">
          {BARRIERS.map((b) => (
            <div key={b.id}>
              <Row selected={barrier === b.id} onClick={() => setBarrier(b.id)}>
                {b.label}
              </Row>
              {b.id === 'others' && barrier === 'others' && (
                <input
                  autoFocus
                  placeholder="Please specify…"
                  value={barrierOther}
                  onChange={(e) => setBarrierOther(e.target.value)}
                  style={inputStyle}
                  className="mt-2 w-full px-4 py-2.5 rounded-sm border text-sm"
                />
              )}
            </div>
          ))}
        </div>
        {submitError && (
          <p style={{ color: RATING_COLORS['Not Prepared'] }} className="text-sm mb-3">
            {submitError}
          </p>
        )}
        <NavButtons
          onBack={() => {
            setQ2Index(2);
            setStage('q2');
          }}
          onNext={handleSubmit}
          nextDisabled={!barrier || (barrier === 'others' && !barrierOther.trim())}
          nextLabel="Submit"
          loading={submitting}
        />
      </div>
    );
  }

  // results
  return (
    <div className="text-center py-4">
      <p style={{ color: COLORS.brass }} className="font-serif text-xs tracking-widest uppercase mb-2">
        Assessment Complete
      </p>
      <h2 style={{ color: COLORS.ink }} className="font-serif text-2xl font-bold mb-2">
        Thank you.
      </h2>
      <p style={{ color: COLORS.muted }} className="mb-7 text-sm">
        Here is your personalised preparedness reading.
      </p>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr style={{ borderColor: COLORS.line }} className="border-b">
              <th style={{ color: COLORS.muted }} className="py-2 pr-3 font-semibold text-xs uppercase tracking-wide">
                Risk
              </th>
              <th style={{ color: COLORS.muted }} className="py-2 pr-3 font-semibold text-xs uppercase tracking-wide">
                % Actions Implemented
              </th>
              <th style={{ color: COLORS.muted }} className="py-2 font-semibold text-xs uppercase tracking-wide">
                Rating
              </th>
            </tr>
          </thead>
          <tbody>
            {topRisks.map((riskId, i) => {
              const risk = RISKS.find((r) => r.id === riskId)!;
              const info = getPreparednessInfo(cleanSelections(riskId));
              const Icon = risk.icon;
              return (
                <tr key={riskId} style={{ borderColor: COLORS.line }} className="border-b">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: risk.color }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: COLORS.white }} />
                      </span>
                      <div className="text-left">
                        <p style={{ color: COLORS.muted }} className="text-[10px] font-semibold tracking-wide">
                          RISK {pad(i + 1)}
                        </p>
                        <p style={{ color: COLORS.ink }} className="font-semibold">
                          {risk.label}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: COLORS.ink }} className="py-3 pr-3 font-medium">
                    {info.pct}%
                  </td>
                  <td className="py-3">
                    <span
                      style={{ backgroundColor: RATING_COLORS[info.rating] + '1A', color: RATING_COLORS[info.rating] }}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                    >
                      {info.rating}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button onClick={reset} style={{ borderColor: COLORS.line, color: COLORS.ink }} className="px-6 py-3 rounded-sm border font-semibold">
        Finish
      </button>
    </div>
  );
}

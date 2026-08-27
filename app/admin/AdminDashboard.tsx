'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, LogOut, BarChart3, Download, Trash2, X, AlertTriangle } from 'lucide-react';
import { COLORS, PASTEL_RISK_COLORS, PASTEL_RATING_COLORS, PASTEL_BAR_COLOR } from '@/lib/theme';
import type { Rating } from '@/lib/domain';
import { Card, PieBlock, BarBlock, ColumnBlock, type ChartDatum } from '../components/ui';

type Stats = {
  totalResponses: number;
  riskFrequency: { id: string; label: string; short: string; color: string; value: number }[];
  top3Ids: string[];
  top3PreparednessByRisk: { id: string; label: string; short: string; color: string; distribution: { name: Rating; value: number }[] }[];
  barrierFrequency: { id: string; label: string; value: number; entries: string[] }[];
};

const DELETE_CONFIRM_PHRASE = 'DELETE';

function formatTimeAgo(date: Date | null) {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' });
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to load dashboard data.');
      setStats(await res.json());
      setLastRefreshed(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/export');
      if (!res.ok) throw new Error('Export failed.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const disposition = res.headers.get('Content-Disposition') ?? '';
      const match = disposition.match(/filename="([^"]+)"/);
      const a = document.createElement('a');
      a.href = url;
      a.download = match?.[1] ?? 'responses.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed.');
    } finally {
      setExporting(false);
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/responses', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete responses.');
      setShowDeleteModal(false);
      setDeleteConfirmText('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete responses.');
    } finally {
      setDeleting(false);
    }
  }

  const riskColumnData: ChartDatum[] =
    stats?.riskFrequency.map((r) => ({ name: r.short, value: r.value, color: PASTEL_RISK_COLORS[r.id] ?? COLORS.ledger })) ?? [];
  const barrierBarData: ChartDatum[] =
    stats?.barrierFrequency
      .filter((b) => b.value > 0)
      .map((b) => ({ name: b.label, value: b.value, color: PASTEL_BAR_COLOR, details: b.entries.length ? b.entries : undefined })) ?? [];

  return (
    <main className="min-h-screen" style={{ backgroundColor: COLORS.paper }}>
      <div className="py-8 px-4 sm:px-8">
      <div className="mx-auto w-full max-w-[1800px]">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 style={{ color: COLORS.ink }} className="font-serif text-xl sm:text-2xl font-bold">
              Boardroom Risk Survey
            </h1>
            <p style={{ color: COLORS.muted }} className="text-sm">
              {stats?.totalResponses ?? 0} response{stats?.totalResponses === 1 ? '' : 's'} collected
              {lastRefreshed ? ` · updated ${formatTimeAgo(lastRefreshed)}` : ''}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={load}
              disabled={loading}
              style={{ borderColor: COLORS.line, color: COLORS.ink }}
              className="px-3 py-2 rounded-sm border text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || !stats?.totalResponses}
              style={{ borderColor: COLORS.line, color: COLORS.ink }}
              className="px-3 py-2 rounded-sm border text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> {exporting ? 'Exporting…' : 'Export to Excel'}
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={!stats?.totalResponses}
              style={{ borderColor: '#E8B0A8', color: '#B3452C' }}
              className="px-3 py-2 rounded-sm border text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> Delete All
            </button>
            <button onClick={handleLogout} style={{ borderColor: COLORS.line, color: COLORS.ink }} className="px-3 py-2 rounded-sm border text-sm font-medium flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: '#B3452C' }} className="text-sm mb-4">
            {error}
          </p>
        )}

        {stats && stats.totalResponses === 0 && !loading ? (
          <div style={{ color: COLORS.muted }} className="text-center py-16">
            <BarChart3 className="w-12 h-12 mx-auto mb-3" />
            <p>No responses yet — results will appear here as clients complete the survey.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            <Card wide>
              <h3 style={{ color: COLORS.ink }} className="font-semibold mb-1">
                Top Risks in the Boardroom
              </h3>
              <p style={{ color: COLORS.muted }} className="text-xs mb-4">
                Question 1 — all 10 risk categories, by number of times selected
              </p>
              <ColumnBlock data={riskColumnData} />
            </Card>

            <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
              <Card>
                <h3 style={{ color: COLORS.ink }} className="font-semibold mb-1">
                  Top 3 Risk - Preparedness Index
                </h3>
                <p style={{ color: COLORS.muted }} className="text-xs mb-4">
                  Not Prepared 0–25% · Somewhat Prepared 26–50% · Prepared 51–75% · Very Prepared 76–100%
                </p>
                <div className="grid sm:grid-cols-3 gap-5">
                  {stats?.top3PreparednessByRisk.map((risk) => {
                    const data: ChartDatum[] = risk.distribution
                      .filter((d) => d.value > 0)
                      .map((d) => ({ name: d.name, value: d.value, color: PASTEL_RATING_COLORS[d.name] }));
                    return (
                      <div key={risk.id}>
                        <h4 style={{ color: COLORS.ink }} className="font-medium text-sm mb-2">
                          {risk.label}
                        </h4>
                        <PieBlock data={data} stacked />
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card>
                <h3 style={{ color: COLORS.ink }} className="font-semibold mb-1">
                  Biggest Barriers to Resilience
                </h3>
                <p style={{ color: COLORS.muted }} className="text-xs mb-4">
                  What do you believe is the biggest barrier preventing organisations from becoming more resilient
                  to emerging risks? — hover a bar to see individual responses (free text for &ldquo;Others&rdquo;).
                </p>
                <BarBlock data={barrierBarData} fullLabels axisWidth={150} />
              </Card>
            </div>
          </div>
        )}
      </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div style={{ backgroundColor: COLORS.white }} className="w-full max-w-sm rounded-sm p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" style={{ color: '#B3452C' }} />
                <h3 style={{ color: COLORS.ink }} className="font-semibold">
                  Delete all responses?
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                style={{ color: COLORS.muted }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p style={{ color: COLORS.muted }} className="text-sm mb-4">
              This permanently deletes all {stats?.totalResponses ?? 0} response
              {stats?.totalResponses === 1 ? '' : 's'} from the database. This cannot be undone. Type{' '}
              <span style={{ color: COLORS.ink }} className="font-semibold">
                {DELETE_CONFIRM_PHRASE}
              </span>{' '}
              to confirm.
            </p>
            <input
              autoFocus
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={DELETE_CONFIRM_PHRASE}
              style={{ borderColor: COLORS.line, color: COLORS.ink }}
              className="w-full px-4 py-2.5 rounded-sm border text-sm mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                style={{ borderColor: COLORS.line, color: COLORS.ink }}
                className="px-4 py-2 rounded-sm border text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteConfirmText !== DELETE_CONFIRM_PHRASE || deleting}
                style={{
                  backgroundColor: deleteConfirmText !== DELETE_CONFIRM_PHRASE || deleting ? COLORS.disabled : '#B3452C',
                  color: COLORS.white,
                }}
                className="px-4 py-2 rounded-sm text-sm font-semibold flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> {deleting ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

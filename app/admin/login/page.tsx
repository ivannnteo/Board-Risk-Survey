'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { COLORS } from '@/lib/theme';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Login failed.');
      }
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen py-8 px-4 flex items-center justify-center" style={{ backgroundColor: COLORS.paper }}>
      <div className="w-full max-w-sm">
        <Link
          href="/"
          style={{ color: COLORS.muted }}
          className="inline-flex items-center gap-1 text-sm font-medium mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <div className="bg-white border rounded-sm p-8" style={{ borderColor: COLORS.line }}>
        <p style={{ color: COLORS.brass }} className="font-serif text-xs tracking-widest uppercase text-center mb-2">
          Board Preparedness Register
        </p>
        <h1 style={{ color: COLORS.ink }} className="font-serif text-xl font-bold text-center mb-6">
          Admin Login
        </h1>
        <form onSubmit={handleSubmit}>
          <label style={{ color: COLORS.ink }} className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ borderColor: COLORS.line, color: COLORS.ink }}
            className="w-full px-4 py-2.5 rounded-sm border text-sm mb-4"
          />
          {error && (
            <p style={{ color: '#B3452C' }} className="text-sm mb-4">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            style={{ backgroundColor: loading || !password ? COLORS.disabled : COLORS.ledger, color: COLORS.white }}
            className="w-full px-6 py-3 rounded-sm font-semibold flex items-center justify-center gap-2 text-sm"
          >
            {loading ? 'Signing in…' : 'Sign in'} {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
        </form>
        </div>
      </div>
    </main>
  );
}

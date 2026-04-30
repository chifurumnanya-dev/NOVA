'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLoginForm />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-7">
        <div className="flex items-center gap-2 text-slate-900">
          <Lock size={16} className="text-green-600" />
          <h1 className="text-lg font-semibold">Admin access</h1>
        </div>
        <p className="mt-2 text-sm text-slate-500">Loading…</p>
      </div>
    </div>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') ?? '/admin';

  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json?.error ?? 'Invalid admin secret.');
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-7">
        <div className="flex items-center gap-2 text-slate-900">
          <Lock size={16} className="text-green-600" />
          <h1 className="text-lg font-semibold">Admin access</h1>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Enter the admin secret to continue. This page is not linked from the public site.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="secret" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Admin secret
            </label>
            <input
              id="secret"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
              placeholder="••••••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !secret}
            className="w-full rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-600/40 disabled:cursor-not-allowed text-white font-semibold py-2.5 text-sm transition-colors"
          >
            {loading ? 'Verifying…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    window.location.href = '/admin/dashboard';
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CF</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-1 text-center">Sign in</h1>
        <p className="text-sm text-slate-500 mb-8 text-center">Admin access only</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="mt-6 w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors duration-150"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <Link href="/" className="mt-6 block text-sm text-center text-slate-500 hover:text-slate-700">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}

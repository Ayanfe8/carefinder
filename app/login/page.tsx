'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MapPin } from 'lucide-react';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    window.location.href = '/';
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setDone(true);
  };

  if (done && tab === 'signup') {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-8 w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-white mb-3">Check your email</h1>
          <p className="text-slate-300 mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your
            account.
          </p>
          <Link
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
          >
            Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-8">
      <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-3 font-semibold border-b-2 transition-colors ${
              tab === 'login'
                ? 'text-white border-indigo-500'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`flex-1 py-3 font-semibold border-b-2 transition-colors ${
              tab === 'signup'
                ? 'text-white border-indigo-500'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} noValidate>
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="login-password" className="block text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-700 rounded-lg px-4 py-3"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors mb-4"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Signup Form */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup} noValidate>
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  minLength={6}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                  placeholder="••••••••"
                />
                <p className="text-xs text-slate-400 mt-1">At least 6 characters</p>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-700 rounded-lg px-4 py-3"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors mb-4"
            >
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>
        )}

        <Link
          href="/"
          className="block text-sm text-center text-slate-400 hover:text-slate-300 transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}

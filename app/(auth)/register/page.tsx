'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <Link
              href="/"
              className="text-2xl font-bold text-emerald-700 tracking-tight"
            >
              Carefinder
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              Nigeria&apos;s Civic Hospital Directory
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-8 w-full text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Check your email
            </h1>
            <p className="text-sm text-gray-500">
              We sent a confirmation link to <strong>{email}</strong>. Click it
              to activate your account.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm text-emerald-600 hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link
            href="/"
            className="text-2xl font-bold text-emerald-700 tracking-tight"
          >
            Carefinder
          </Link>
          <p className="text-sm text-gray-500 mt-1">
            Nigeria&apos;s Civic Hospital Directory
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Create account
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            Join Carefinder to rate and review hospitals
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  minLength={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Minimum 6 characters
                </p>
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
              className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-emerald-600 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

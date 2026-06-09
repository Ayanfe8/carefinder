'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-8 w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-white mb-3">Check your email</h1>
          <p className="text-slate-300 mb-6">
            We sent a password reset link to <strong>{email}</strong>. Click it to set a new password.
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
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-1">Reset password</h1>
        <p className="text-slate-400 text-sm mb-8">Enter your email to receive a password reset link</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
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
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 text-sm text-red-400 bg-red-900/20 border border-red-700 rounded-lg px-4 py-3"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center text-sm text-slate-400 hover:text-slate-300 transition-colors gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>
    </main>
  );
}

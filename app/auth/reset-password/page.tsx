'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/login'), 2000);
  };

  if (success) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-8 w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-white mb-3">Password reset!</h1>
          <p className="text-slate-300">
            Your password has been updated. Redirecting to login…
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-1">Create new password</h1>
        <p className="text-slate-400 text-sm mb-8">Enter your new password below</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                New password
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
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                placeholder="••••••••"
              />
              <p className="text-xs text-slate-400 mt-1">At least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
                minLength={6}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                placeholder="••••••••"
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
            disabled={loading || !password || !confirmPassword}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-6 block text-sm text-center text-slate-400 hover:text-slate-300 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}

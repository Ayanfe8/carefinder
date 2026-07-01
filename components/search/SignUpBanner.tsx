'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function SignUpBanner() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  // Don't render while checking auth or if logged in or dismissed
  if (isLoggedIn === null || isLoggedIn || dismissed) return null;

  return (
    <div className="mb-4 flex items-center justify-between gap-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
      <p className="text-sm text-emerald-800">
        <span className="font-medium">Found a hospital you trust?</span>{' '}
        <Link
          href="/register"
          className="underline underline-offset-2 hover:text-emerald-600 transition-colors"
        >
          Create a free account
        </Link>{' '}
        to rate and review hospitals for others in your community.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 text-emerald-600 hover:text-emerald-800 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

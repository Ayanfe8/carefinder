'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { submitReview } from '@/lib/supabase/queries';

interface RatingWidgetProps {
  hospitalId: string;
  ratingAvg: number;
  reviewCount: number;
}

export function RatingWidget({ hospitalId, ratingAvg, reviewCount }: RatingWidgetProps) {
  // null = session check pending; true/false = resolved
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [text, setText] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const supabase = createClient();
    // getUser() validates the JWT with the Supabase server — never stale unlike getSession()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });
  }, []);

  const handleStarClick = (star: number) => {
    if (isAuthenticated !== true) {
      setShowLoginPrompt(true);
      return;
    }
    setSelected(star);
    setShowLoginPrompt(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setStatus('submitting');
    setErrorMsg('');

    try {
      const supabase = createClient();
      await submitReview(supabase, hospitalId, selected, text.trim() || undefined);
      setStatus('submitted');
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to submit review. Please try again.'
      );
    }
  };

  if (status === 'submitted') {
    return (
      <section aria-label="Rate this hospital" className="bg-emerald-50 rounded-xl p-5 text-center">
        <p className="font-medium text-emerald-700">Thank you for your review!</p>
        <p className="text-sm text-emerald-600 mt-1">
          It will appear once approved by a moderator.
        </p>
      </section>
    );
  }

  const ratingInfo = (
    <p className="text-sm text-gray-500 mb-4">
      {ratingAvg > 0
        ? `Current rating: ${ratingAvg.toFixed(1)} (${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})`
        : 'No ratings yet — be the first!'}
    </p>
  );

  // Session check is still pending — render non-interactive placeholder so no
  // click handler can fire before we know the auth state.
  if (isAuthenticated === null) {
    return (
      <section aria-label="Rate this hospital" className="bg-gray-50 rounded-xl p-5">
        <h2 className="font-semibold text-gray-800 mb-1">Rate this hospital</h2>
        {ratingInfo}
        <div className="flex gap-1" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="text-2xl text-gray-200 select-none">
              ★
            </span>
          ))}
        </div>
      </section>
    );
  }

  const displayRating = hovered > 0 ? hovered : selected;

  return (
    <section aria-label="Rate this hospital" className="bg-gray-50 rounded-xl p-5">
      <h2 className="font-semibold text-gray-800 mb-1">Rate this hospital</h2>
      {ratingInfo}

      <div className="flex items-center gap-1 mb-3" role="group" aria-label="Select star rating">
        {Array.from({ length: 5 }, (_, i) => {
          const star = i + 1;
          const isActive = star <= displayRating;
          return (
            <button
              key={star}
              type="button"
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => isAuthenticated === true && setHovered(star)}
              onMouseLeave={() => isAuthenticated === true && setHovered(0)}
              className={`text-2xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded cursor-pointer ${
                isActive ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
              }`}
            >
              ★
            </button>
          );
        })}
      </div>

      {/* Strict false check — never shown while session is still loading */}
      {isAuthenticated === false && showLoginPrompt && (
        <p className="text-sm text-gray-600 mb-3" role="status">
          <Link href="/login" className="text-emerald-600 hover:underline font-medium">
            Sign in
          </Link>{' '}
          or{' '}
          <Link href="/register" className="text-emerald-600 hover:underline font-medium">
            create an account
          </Link>{' '}
          to rate this hospital.
        </p>
      )}

      {/* Strict true check — never shown while session is still loading */}
      {isAuthenticated === true && selected > 0 && (
        <form onSubmit={handleSubmit} className="mt-2 space-y-3">
          <div>
            <label htmlFor="review-text" className="block text-sm text-gray-700 mb-1">
              Review <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="review-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your experience…"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {status === 'error' && (
            <p className="text-sm text-red-600" role="alert">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit review'}
          </button>
        </form>
      )}
    </section>
  );
}

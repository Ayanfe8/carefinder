'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { encodeFilters, decodeFilters } from '@/lib/share';
import type { Hospital } from '@/lib/types';

interface ShareButtonProps {
  hospitals: Hospital[];
}

export function ShareButton({ hospitals }: ShareButtonProps) {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [to, setTo] = useState('');
  const [senderName, setSenderName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'ratelimit'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const emailTriggerRef = useRef<HTMLButtonElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const wasOpenedRef = useRef(false);

  // Move focus into modal on open; return it to trigger on close.
  useEffect(() => {
    if (emailOpen) {
      wasOpenedRef.current = true;
      firstInputRef.current?.focus();
    } else if (wasOpenedRef.current) {
      emailTriggerRef.current?.focus();
    }
  }, [emailOpen]);

  // Dismiss with Escape key.
  useEffect(() => {
    if (!emailOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEmailOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [emailOpen]);

  const handleCopyLink = async () => {
    const filters = decodeFilters(new URLSearchParams(searchParams.toString()));
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const url = encodeFilters(filters, siteUrl);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };

  const toggleHospital = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleEmailOpen = () => {
    setSelectedIds(hospitals.slice(0, 20).map((h) => h.id));
    setTo('');
    setSenderName('');
    setStatus('idle');
    setErrorMsg('');
    setEmailOpen(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          hospitalIds: selectedIds,
          senderName: senderName.trim() || undefined,
        }),
      });

      if (res.status === 429) {
        setStatus('ratelimit');
        setErrorMsg('Too many requests. Please wait a moment and try again.');
        return;
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus('error');
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setStatus('sent');
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please check your connection and try again.');
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopyLink}
          className="text-sm text-gray-600 hover:text-emerald-600 border border-gray-300 hover:border-emerald-400 px-3 py-1.5 rounded-lg transition-colors"
          aria-label={copied ? 'Link copied to clipboard' : 'Copy shareable link'}
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

        {hospitals.length > 0 && (
          <button
            ref={emailTriggerRef}
            type="button"
            onClick={handleEmailOpen}
            aria-haspopup="dialog"
            aria-expanded={emailOpen}
            className="text-sm text-gray-600 hover:text-emerald-600 border border-gray-300 hover:border-emerald-400 px-3 py-1.5 rounded-lg transition-colors"
            aria-label="Email this hospital list"
          >
            Email
          </button>
        )}
      </div>

      {emailOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEmailOpen(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-xl p-6 w-[480px] max-w-full max-h-[90vh] overflow-y-auto">
            {status === 'sent' ? (
              <div className="py-6 text-center">
                <p className="text-emerald-600 font-semibold text-lg mb-2">Email sent!</p>
                <p className="text-sm text-gray-500 mb-6">
                  The hospital list was sent to <strong>{to}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setEmailOpen(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit}>
                <h2 id="share-dialog-title" className="font-semibold text-gray-900 mb-4">
                  Email this hospital list
                </h2>

                <div className="space-y-3 mb-4">
                  <div>
                    <label htmlFor="share-to" className="block text-sm text-gray-700 mb-1">
                      Recipient email{' '}
                      <span aria-hidden="true" className="text-red-500">
                        *
                      </span>
                    </label>
                    <input
                      ref={firstInputRef}
                      id="share-to"
                      type="email"
                      required
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="share-sender" className="block text-sm text-gray-700 mb-1">
                      Your name{' '}
                      <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      id="share-sender"
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Dr. Adewale"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <fieldset className="mb-4">
                  <legend className="text-sm font-medium text-gray-700 mb-2">
                    Hospitals to include ({selectedIds.length}/
                    {Math.min(hospitals.length, 20)} selected)
                  </legend>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {hospitals.slice(0, 20).map((h) => (
                      <label key={h.id} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(h.id)}
                          onChange={() => toggleHospital(h.id)}
                          className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">
                          {h.name}
                          <span className="text-xs text-gray-400 ml-1">— {h.city}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {(status === 'error' || status === 'ratelimit') && (
                  <p className="text-sm text-red-600 mb-3" role="alert">
                    {errorMsg}
                  </p>
                )}

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setEmailOpen(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'sending' || selectedIds.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                  >
                    {status === 'sending' ? 'Sending…' : 'Send Email'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { exportHospitalsCSV, ALL_EXPORT_COLUMNS } from '@/lib/csv';
import type { Hospital } from '@/lib/types';

interface HospitalCardProps {
  hospital: Hospital;
  /** km from user — shown only when geolocation was active at search time */
  distance?: number | null;
  /** Show Export / Share action buttons (list view only) */
  showActions?: boolean;
}

function StarRating({ value }: { value: number }) {
  const filled = Math.round(value);
  return (
    <span aria-label={`Rating: ${value.toFixed(1)} out of 5`} className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < filled ? 'text-yellow-400' : 'text-gray-300'} aria-hidden>
          ★
        </span>
      ))}
      <span className="text-xs text-gray-500 ml-1">{value.toFixed(1)}</span>
    </span>
  );
}

export function HospitalCard({ hospital, distance, showActions = false }: HospitalCardProps) {
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    exportHospitalsCSV([hospital], ALL_EXPORT_COLUMNS, hospital.name);
  };

  const handleShare = async () => {
    const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/hospitals/${hospital.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };

  return (
    <article
      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
      aria-label={hospital.name}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link
            href={`/hospitals/${hospital.id}`}
            className="font-semibold text-gray-900 hover:text-emerald-700 transition-colors text-base leading-tight line-clamp-2"
          >
            {hospital.name}
          </Link>

          <p className="text-sm text-gray-500 mt-1 truncate">
            {hospital.address}, {hospital.city}
          </p>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <StarRating value={hospital.rating_avg} />
            <span className="text-xs text-gray-400">({hospital.review_count})</span>

            {distance != null && (
              <span className="text-xs text-emerald-600 font-medium">
                {distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`}
              </span>
            )}

            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                hospital.ownership === 'public'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-purple-50 text-purple-700'
              }`}
            >
              {hospital.ownership === 'public' ? 'Public' : 'Private'}
            </span>
          </div>

          {hospital.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2" aria-label="Specialties">
              {hospital.specialties.map((s) => (
                <span
                  key={s}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {showActions && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-3 text-sm">
          <button
            type="button"
            onClick={handleExport}
            className="text-gray-500 hover:text-emerald-600 transition-colors"
            aria-label={`Export ${hospital.name} as CSV`}
          >
            Export
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="text-gray-500 hover:text-emerald-600 transition-colors"
            aria-label={copied ? 'Link copied' : `Copy link to ${hospital.name}`}
          >
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      )}
    </article>
  );
}

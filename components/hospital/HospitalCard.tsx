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
        <span key={i} className={i < filled ? 'text-amber-500' : 'text-slate-300'} aria-hidden>
          ★
        </span>
      ))}
      <span className="text-xs text-slate-400 ml-1">{value.toFixed(1)}</span>
    </span>
  );
}

function getSpecialtyBadgeColor(specialty: string): { bg: string; text: string } {
  const normalized = specialty.toLowerCase();

  if (normalized.includes('cardiology') || normalized === 'general') {
    return { bg: 'bg-blue-100', text: 'text-blue-800' };
  }
  if (normalized.includes('maternity') || normalized.includes('obstetric')) {
    return { bg: 'bg-pink-50', text: 'text-pink-800' };
  }
  if (normalized.includes('emergency')) {
    return { bg: 'bg-red-100', text: 'text-red-700' };
  }
  if (normalized.includes('dental')) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-800' };
  }
  if (normalized.includes('pediatric')) {
    return { bg: 'bg-blue-50', text: 'text-blue-700' };
  }

  return { bg: 'bg-blue-100', text: 'text-blue-800' };
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

  const borderColor = hospital.ownership === 'public' ? 'border-l-blue-700' : 'border-l-green-600';
  const ownershipBg = hospital.ownership === 'public' ? 'bg-blue-100' : 'bg-green-100';
  const ownershipText = hospital.ownership === 'public' ? 'text-blue-800' : 'text-green-800';
  const ownershipBorder = hospital.ownership === 'public' ? 'border-blue-200' : 'border-green-200';

  return (
    <article
      className={`bg-white border border-slate-200 border-l-[5px] ${borderColor} rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-150`}
      aria-label={hospital.name}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link
              href={`/hospitals/${hospital.id}`}
              className="font-bold text-slate-900 hover:text-blue-700 transition-colors text-base leading-tight line-clamp-2"
            >
              {hospital.name}
            </Link>
            <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap border ${ownershipBg} ${ownershipText} ${ownershipBorder}`}>
              {hospital.ownership === 'public' ? 'Public' : 'Private'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-slate-500 truncate">
              {hospital.address}, {hospital.city}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <StarRating value={hospital.rating_avg} />
            <span className="text-xs text-slate-400">({hospital.review_count})</span>

            {distance != null && (
              <span className="text-xs text-green-600 font-medium">
                {distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`}
              </span>
            )}
          </div>

          {hospital.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3" aria-label="Specialties">
              {hospital.specialties.map((s) => {
                const colors = getSpecialtyBadgeColor(s);
                return (
                  <span key={s} className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${colors.bg} ${colors.text}`}>
                    {s}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showActions && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex gap-4 text-sm">
          <button
            type="button"
            onClick={handleExport}
            className="text-slate-700 hover:text-blue-700 transition-colors font-medium"
            aria-label={`Export ${hospital.name} as CSV`}
          >
            Export
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="text-slate-700 hover:text-blue-700 transition-colors font-medium"
            aria-label={copied ? 'Link copied' : `Copy link to ${hospital.name}`}
          >
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      )}
    </article>
  );
}

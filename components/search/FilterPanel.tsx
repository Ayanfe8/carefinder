'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const SPECIALTIES = [
  { value: 'general', label: 'General' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'maternity', label: 'Maternity' },
  { value: 'pediatric', label: 'Pediatric' },
  { value: 'dental', label: 'Dental' },
  { value: 'orthopedic', label: 'Orthopedic' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'eye', label: 'Eye' },
];

export function FilterPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSpecialties = searchParams.getAll('specialty');
  const activeOwnership = searchParams.get('ownership') ?? '';

  const updateParams = useCallback(
    (updater: (p: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const toggleSpecialty = (value: string) => {
    updateParams((p) => {
      const current = p.getAll('specialty');
      p.delete('specialty');
      if (current.includes(value)) {
        current.filter((s) => s !== value).forEach((s) => p.append('specialty', s));
      } else {
        [...current, value].forEach((s) => p.append('specialty', s));
      }
    });
  };

  const setOwnership = (value: string) => {
    updateParams((p) => {
      if (value) p.set('ownership', value);
      else p.delete('ownership');
    });
  };

  const clearAll = () => {
    updateParams((p) => {
      p.delete('specialty');
      p.delete('ownership');
    });
  };

  const hasActiveFilters = activeSpecialties.length > 0 || activeOwnership;

  return (
    <aside aria-label="Search filters" className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-blue-700 hover:text-blue-800 font-medium"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Specialty */}
      <fieldset>
        <legend className="text-sm font-medium text-slate-700 mb-2">Specialty</legend>
        <div className="space-y-1.5">
          {SPECIALTIES.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeSpecialties.includes(value)}
                onChange={() => toggleSpecialty(value)}
                aria-label={`Filter by ${label}`}
                className="rounded border-slate-300 text-blue-700 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Ownership */}
      <fieldset>
        <legend className="text-sm font-medium text-slate-700 mb-2">Ownership</legend>
        <div className="space-y-1.5">
          {[
            { value: '', label: 'All' },
            { value: 'public', label: 'Public' },
            { value: 'private', label: 'Private' },
          ].map(({ value, label }) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="ownership"
                checked={activeOwnership === value}
                onChange={() => setOwnership(value)}
                aria-label={`${label} hospitals`}
                className="border-slate-300 text-blue-700 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </aside>
  );
}

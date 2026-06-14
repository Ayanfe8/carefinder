'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

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

interface FilterPanelProps {
  mobile?: boolean;
}

export function FilterPanel({ mobile = false }: FilterPanelProps) {
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
  const [isOpen, setIsOpen] = useState(false);

  const filterContent = (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-emerald-600 hover:text-emerald-700"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Specialty */}
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-2">Specialty</legend>
        <div className="space-y-1.5">
          {SPECIALTIES.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeSpecialties.includes(value)}
                onChange={() => toggleSpecialty(value)}
                aria-label={`Filter by ${label}`}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-600">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Ownership */}
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-2">Ownership</legend>
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
                className="border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-600">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );

  if (mobile) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          aria-expanded={isOpen}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="ml-auto bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
              {activeSpecialties.length + (activeOwnership ? 1 : 0)}
            </span>
          )}
        </button>
        {isOpen && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mt-2 space-y-6">
            {filterContent}
          </div>
        )}
      </div>
    );
  }

  return (
    <aside aria-label="Search filters" className="space-y-6">
      {filterContent}
    </aside>
  );
}

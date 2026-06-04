'use client';

import { useState, useMemo } from 'react';
import { HospitalCard } from '@/components/hospital/HospitalCard';
import { ExportButton } from '@/components/ui/ExportButton';
import type { Hospital } from '@/lib/types';

type SortKey = 'name' | 'rating' | 'distance';

interface ResultsListProps {
  hospitals: Hospital[];
  hasGeolocation?: boolean;
  query?: string;
}

function sortHospitals(hospitals: Hospital[], key: SortKey): Hospital[] {
  return [...hospitals].sort((a, b) => {
    switch (key) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return (b.rating_avg ?? 0) - (a.rating_avg ?? 0);
      case 'distance':
        return (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity);
    }
  });
}

export function ResultsList({ hospitals, hasGeolocation = false, query = '' }: ResultsListProps) {
  const [sortBy, setSortBy] = useState<SortKey>('name');

  const sorted = useMemo(() => sortHospitals(hospitals, sortBy), [hospitals, sortBy]);

  if (hospitals.length === 0) {
    return (
      <div className="py-16 text-center text-gray-500" role="status">
        <p className="text-lg font-medium mb-1">No hospitals found</p>
        <p className="text-sm">Try a different search term or adjust your filters.</p>
      </div>
    );
  }

  return (
    <section aria-label="Search results">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500" aria-live="polite">
          {hospitals.length} hospital{hospitals.length !== 1 ? 's' : ''} found
        </p>

        <div className="flex items-center gap-3">
          <ExportButton hospitals={hospitals} query={query} />

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm text-gray-500">
              Sort:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Sort results"
            >
              <option value="name">Name (A–Z)</option>
              <option value="rating">Rating (highest first)</option>
              <option value="distance" disabled={!hasGeolocation}>
                Distance {!hasGeolocation ? '(enable location)' : '(nearest first)'}
              </option>
            </select>
          </div>
        </div>
      </div>

      <ul className="space-y-3" role="list" aria-label="Hospital results">
        {sorted.map((hospital) => (
          <li key={hospital.id} id={`hospital-${hospital.id}`}>
            <HospitalCard
              hospital={hospital}
              distance={hospital.distance_km ?? null}
              showActions
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

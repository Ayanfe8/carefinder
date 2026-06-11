'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import type { Hospital } from '@/lib/types';

// Lazy-load HospitalMap — Mapbox GL JS uses browser APIs unavailable on the server.
// The map only initialises when the user explicitly toggles to map view (free-tier protection).
const HospitalMap = dynamic(
  () => import('@/components/map/HospitalMap').then((m) => m.HospitalMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl" /> }
);

interface MapToggleProps {
  hospitals: Hospital[];
  userLocation?: [number, number] | null;
  radiusKm?: number | null;
}

export function MapToggle({ hospitals, userLocation, radiusKm }: MapToggleProps) {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleMarkerClick = useCallback((hospitalId: string) => {
    setSelectedId(hospitalId);
    // Scroll the matching card into view in the list when on desktop
    const el = document.getElementById(`hospital-${hospitalId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  return (
    <div>
      {/* Toggle buttons */}
      <div
        className="inline-flex rounded-lg border border-slate-200 mb-4 overflow-hidden"
        role="group"
        aria-label="Switch between list and map view"
      >
        <button
          type="button"
          onClick={() => setView('list')}
          aria-pressed={view === 'list'}
          className={`px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
            view === 'list' ? 'bg-blue-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          List
        </button>
        <button
          type="button"
          onClick={() => setView('map')}
          aria-pressed={view === 'map'}
          className={`px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
            view === 'map' ? 'bg-blue-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Map
        </button>
      </div>

      {/* Map view — only mounts when toggled */}
      {view === 'map' && (
        <div className="h-[520px] mb-6">
          <ErrorBoundary
            fallback={
              <div role="alert" className="w-full h-full flex items-center justify-center rounded-xl border border-red-200 bg-red-50">
                <p className="text-sm text-red-600">Map failed to load. Check your connection and try again.</p>
              </div>
            }
          >
            <HospitalMap
              hospitals={hospitals}
              userLocation={userLocation}
              radiusKm={radiusKm}
              onMarkerClick={handleMarkerClick}
            />
          </ErrorBoundary>
        </div>
      )}

      {/* Selected hospital highlight */}
      {selectedId && view === 'map' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <a href={`/hospitals/${selectedId}`} className="font-medium hover:underline">
            View hospital details →
          </a>
        </div>
      )}
    </div>
  );
}

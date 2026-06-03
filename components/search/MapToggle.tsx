'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import type { Hospital } from '@/lib/types';

// Lazy-load HospitalMap — Mapbox GL JS uses browser APIs unavailable on the server.
// The map only initialises when the user explicitly toggles to map view (free-tier protection).
const HospitalMap = dynamic(
  () => import('@/components/map/HospitalMap').then((m) => m.HospitalMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl" /> }
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
        className="inline-flex rounded-lg border border-gray-200 mb-4 overflow-hidden"
        role="group"
        aria-label="Switch between list and map view"
      >
        <button
          type="button"
          onClick={() => setView('list')}
          aria-pressed={view === 'list'}
          className={`px-4 py-1.5 text-sm font-medium transition-colors ${
            view === 'list' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          List
        </button>
        <button
          type="button"
          onClick={() => setView('map')}
          aria-pressed={view === 'map'}
          className={`px-4 py-1.5 text-sm font-medium transition-colors ${
            view === 'map' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Map
        </button>
      </div>

      {/* Map view — only mounts when toggled */}
      {view === 'map' && (
        <div className="h-[520px] mb-6">
          <HospitalMap
            hospitals={hospitals}
            userLocation={userLocation}
            radiusKm={radiusKm}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      )}

      {/* Selected hospital highlight */}
      {selectedId && view === 'map' && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
          <a href={`/hospitals/${selectedId}`} className="font-medium hover:underline">
            View hospital details →
          </a>
        </div>
      )}
    </div>
  );
}

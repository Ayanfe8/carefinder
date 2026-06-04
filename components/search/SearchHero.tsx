'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

type GeoStatus = 'idle' | 'loading' | 'granted' | 'denied';

export function SearchHero() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(10);

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Coordinates stay in JS memory only — never written to DB or logged
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus('granted');
      },
      () => {
        // Silent fallback: denial shows no error, text search still works
        setGeoStatus('denied');
      },
      { timeout: 8000 }
    );
  }, []);

  // Read directly from the DOM ref so navigation always uses the current input
  // value regardless of React state batching (important for Playwright click tests).
  const handleSearch = useCallback(() => {
    const value = (inputRef.current?.value ?? query).trim();
    const params = new URLSearchParams();
    if (value) params.set('q', value);
    if (coords && geoStatus === 'granted') {
      params.set('lat', String(coords.lat));
      params.set('lng', String(coords.lng));
      params.set('radius', String(radius));
    }
    const qs = params.toString();
    router.push(`/search${qs ? `?${qs}` : ''}`);
  }, [router, query, coords, geoStatus, radius]);

  return (
    <section className="bg-gradient-to-b from-emerald-50 to-white py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Find a Hospital in Nigeria
        </h1>
        <p className="text-lg text-gray-500 mb-10">
          Search by name, city, or LGA. Filter by specialty, ownership, and distance.
        </p>

        <form
          role="search"
          aria-label="Hospital search"
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
        >
          <div className="flex gap-2 mb-4">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, city, or LGA…"
              aria-label="Search hospitals"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Search
            </button>
          </div>

          {/* Geolocation section */}
          <div className="text-sm text-gray-500">
            {geoStatus === 'idle' && (
              <button
                type="button"
                onClick={requestGeolocation}
                className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
                aria-label="Use your location to find nearby hospitals"
              >
                📍 Use my location to find nearby hospitals
              </button>
            )}

            {geoStatus === 'loading' && (
              <span aria-live="polite">Requesting location…</span>
            )}

            {geoStatus === 'granted' && (
              <div className="mt-3 flex flex-col items-center gap-2">
                <div className="flex items-center gap-3 w-full max-w-sm">
                  <label htmlFor="radius-slider" className="whitespace-nowrap text-gray-600">
                    Within
                  </label>
                  <input
                    id="radius-slider"
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="flex-1 accent-emerald-600"
                    aria-label={`Search radius: ${radius} km`}
                  />
                  <span className="whitespace-nowrap text-gray-700 font-medium w-16 text-right">
                    {radius} km
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Location stays on your device — never stored
                </p>
              </div>
            )}

            {/* denied: no message shown — graceful silent fallback */}
          </div>
        </form>

        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
          <a href="/search" className="hover:text-emerald-600 transition-colors">
            Browse all hospitals →
          </a>
          <span>·</span>
          <span>20+ hospitals across Nigeria</span>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Map,
  Download,
  Share2,
  Star,
  Clock,
  ShieldCheck,
  Navigation,
} from 'lucide-react';

type GeoStatus = 'idle' | 'loading' | 'granted' | 'denied';

export default function HomePage() {
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
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus('granted');
      },
      () => {
        setGeoStatus('denied');
      },
      { timeout: 8000 }
    );
  }, []);

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

  const features = [
    { icon: Search, label: 'Search', description: 'Find hospitals by name or location' },
    { icon: Map, label: 'Map View', description: 'Explore hospitals on an interactive map' },
    { icon: Download, label: 'Export CSV', description: 'Download hospital data as CSV' },
    { icon: Share2, label: 'Share Results', description: 'Share filtered results with others' },
    { icon: Star, label: 'Ratings', description: 'View community ratings and reviews' },
    { icon: Clock, label: 'Hours', description: 'Check visiting hours and availability' },
    { icon: ShieldCheck, label: 'Verified', description: 'All hospitals verified and up-to-date' },
    { icon: Navigation, label: 'Directions', description: 'Get directions to nearby hospitals' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <span className="text-sm font-semibold">Nigeria&apos;s Civic Hospital Directory</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">Find the Right Hospital, Right Now</h1>
          <p className="text-lg text-blue-50 mb-12">
            Search, filter, and share information about hospitals across Nigeria. Free and verified.
          </p>

          {/* Search Bar */}
          <form
            role="search"
            aria-label="Hospital search"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="space-y-4"
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, city, or LGA…"
                aria-label="Search hospitals"
                className="flex-1 rounded-full border-0 px-6 py-4 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-4 rounded-full transition-colors"
              >
                Search
              </button>
            </div>

            {/* Geolocation */}
            <div className="text-sm">
              {geoStatus === 'idle' && (
                <button
                  type="button"
                  onClick={requestGeolocation}
                  className="text-white hover:text-blue-50 underline underline-offset-2 flex items-center justify-center gap-2 mx-auto"
                >
                  <Navigation className="w-4 h-4" />
                  Hospitals near me
                </button>
              )}

              {geoStatus === 'loading' && (
                <span className="text-white/80" aria-live="polite">
                  Requesting location…
                </span>
              )}

              {geoStatus === 'granted' && (
                <div className="mt-4 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2">
                    <label htmlFor="radius-slider" className="whitespace-nowrap text-white/90">
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
                      className="w-32 accent-white"
                      aria-label={`Search radius: ${radius} km`}
                    />
                    <span className="whitespace-nowrap text-white font-semibold w-16 text-right">
                      {radius} km
                    </span>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center pt-8 border-t border-white/20">
            <div>
              <div className="text-3xl font-bold">21+</div>
              <div className="text-sm text-blue-100 mt-1">Hospitals Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold">5</div>
              <div className="text-sm text-blue-100 mt-1">Major Cities</div>
            </div>
            <div>
              <div className="text-3xl font-bold">10+</div>
              <div className="text-sm text-blue-100 mt-1">Specialties</div>
            </div>
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-blue-100 mt-1">Free to Use</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything you need to find care
            </h2>
            <p className="text-lg text-slate-600">
              Comprehensive hospital information at your fingertips
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.label}
                  className="border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-700" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{feature.label}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How it works</h2>
            <p className="text-lg text-slate-600">Get hospital information in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: '01', title: 'Search', desc: 'Enter a hospital name, city, or specialty to start' },
              { number: '02', title: 'Filter', desc: 'Narrow results by location, ownership, or specialty' },
              { number: '03', title: 'Export & Share', desc: 'Download as CSV or share results with others' },
            ].map((step) => (
              <div key={step.number} className="text-center">
                <div className="text-5xl font-bold text-blue-700 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to find a hospital?</h2>
          <p className="text-lg text-slate-600 mb-8">
            Start searching hospitals across Nigeria right now
          </p>
          <Link
            href="/search"
            className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-150 text-lg"
          >
            Browse All Hospitals →
          </Link>
        </div>
      </section>
    </>
  );
}

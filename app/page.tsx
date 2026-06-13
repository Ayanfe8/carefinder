'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Search,
  MapPin,
  Download,
  Share2,
  Star,
  Clock,
  CheckCircle,
  Compass,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const features = [
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find hospitals by name, city, LGA, or specialty',
    },
    {
      icon: MapPin,
      title: 'Map View',
      description: 'See hospital locations and nearby facilities at a glance',
    },
    {
      icon: Compass,
      title: 'Distance Filter',
      description: 'Search hospitals within your preferred radius',
    },
    {
      icon: Star,
      title: 'Ratings & Reviews',
      description: 'Read and share experiences from real patients',
    },
    {
      icon: Clock,
      title: 'Visiting Hours',
      description: 'Check operating hours and service availability',
    },
    {
      icon: Download,
      title: 'Export Data',
      description: 'Download search results as CSV for offline access',
    },
    {
      icon: Share2,
      title: 'Share Results',
      description: 'Share filtered results via email with colleagues',
    },
    {
      icon: CheckCircle,
      title: 'Verified Data',
      description: 'Curated and verified hospital information',
    },
  ];

  const stats = [
    { number: '500+', label: 'Hospitals' },
    { number: '36', label: 'States' },
    { number: '100%', label: 'Free' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section with Stats */}
      <section className="bg-gradient-to-b from-emerald-50 to-white px-4 py-10 sm:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Main heading and subheading */}
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-5 leading-tight">
              Find the Right Hospital,{' '}
              <span className="text-emerald-600">Get the Care You Need</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Navigate Nigeria&apos;s hospital landscape with confidence. Search, compare, and discover verified healthcare facilities across all 36 states.
            </p>
          </div>

          {/* Search form */}
          <div className="mb-12 sm:mb-14">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              role="search"
              aria-label="Hospital search"
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by hospital name, city, or specialty…"
                aria-label="Search hospitals"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3.5 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 sm:px-8 py-3.5 rounded-lg transition-colors whitespace-nowrap active:bg-emerald-800"
              >
                Search
              </button>
            </form>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Link
                href="/search"
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Browse all hospitals
              </Link>
              <span>·</span>
              <span>No account needed</span>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 py-6 sm:py-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-1">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-12 sm:py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Everything You Need
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Comprehensive tools to find and evaluate hospitals
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-start p-6 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:py-24 bg-emerald-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Start Finding Healthcare Today
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            Join thousands exploring Nigeria&apos;s hospital network. No signup required—search immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => router.push('/search')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors active:bg-emerald-800"
            >
              Explore Hospitals
            </button>
            <Link
              href="/register"
              className="border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold px-8 py-3.5 rounded-lg transition-colors text-center"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

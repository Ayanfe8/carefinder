import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { searchHospitals } from '@/lib/supabase/queries';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterPanel } from '@/components/search/FilterPanel';
import { ResultsList } from '@/components/search/ResultsList';
import { MapToggle } from '@/components/search/MapToggle';
import type { SearchFilters, Pagination } from '@/lib/types';
import type { Metadata } from 'next';

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const q = typeof searchParams['q'] === 'string' ? searchParams['q'] : '';
  return {
    title: q ? `"${q}" — Hospital Search` : 'Find Hospitals',
  };
}

function parseSearchParams(raw: SearchPageProps['searchParams']): {
  query: string;
  filters: SearchFilters;
  pagination: Pagination;
  sortBy: 'name' | 'rating' | 'distance';
  hasGeolocation: boolean;
} {
  const query = typeof raw['q'] === 'string' ? raw['q'] : '';

  const specialtyRaw = raw['specialty'];
  const specialty = Array.isArray(specialtyRaw)
    ? specialtyRaw
    : specialtyRaw
      ? [specialtyRaw]
      : [];

  const ownershipRaw = raw['ownership'];
  const ownership =
    ownershipRaw === 'public' || ownershipRaw === 'private' ? ownershipRaw : null;

  const lat = typeof raw['lat'] === 'string' ? parseFloat(raw['lat']) : undefined;
  const lng = typeof raw['lng'] === 'string' ? parseFloat(raw['lng']) : undefined;
  const radius = typeof raw['radius'] === 'string' ? parseFloat(raw['radius']) : null;

  const hasGeolocation = lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng);

  const sortRaw = raw['sort'];
  const sortBy: 'name' | 'rating' | 'distance' =
    sortRaw === 'rating' || sortRaw === 'distance' ? sortRaw : 'name';

  const page = typeof raw['page'] === 'string' ? Math.max(1, parseInt(raw['page'], 10)) : 1;

  const filters: SearchFilters = {
    specialty,
    ownership,
    radius: hasGeolocation ? (radius ?? null) : null,
    lat: hasGeolocation ? lat : undefined,
    lng: hasGeolocation ? lng : undefined,
  };

  return {
    query,
    filters,
    pagination: { page, pageSize: 20 },
    sortBy: hasGeolocation ? sortBy : sortBy === 'distance' ? 'name' : sortBy,
    hasGeolocation,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { query, filters, pagination, sortBy, hasGeolocation } = parseSearchParams(searchParams);

  const supabase = createClient();
  const hospitals = await searchHospitals(supabase, query, filters, pagination, sortBy);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Search bar */}
      <div className="mb-6">
        <Suspense>
          <SearchBar defaultValue={query} />
        </Suspense>
      </div>

      <div className="flex gap-8">
        {/* Filter sidebar */}
        <div className="hidden md:block w-52 flex-shrink-0">
          <Suspense>
            <FilterPanel />
          </Suspense>
        </div>

        {/* Results + Map */}
        <div className="flex-1 min-w-0">
          {/* Map/list toggle — map only initialises when user explicitly switches */}
          <MapToggle
            hospitals={hospitals}
            userLocation={
              filters.lat != null && filters.lng != null
                ? [filters.lng, filters.lat]
                : null
            }
            radiusKm={filters.radius}
          />

          <Suspense
            fallback={
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-28 animate-pulse" />
                ))}
              </div>
            }
          >
            <ResultsList hospitals={hospitals} hasGeolocation={hasGeolocation} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

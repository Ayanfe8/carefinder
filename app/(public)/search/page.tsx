import { Suspense } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterPanel } from '@/components/search/FilterPanel';
import { ResultsListSkeleton } from '@/components/search/ResultsListSkeleton';
import { SearchResults } from '@/components/search/SearchResults';
import { SignUpBanner } from '@/components/search/SignUpBanner';
import type { SearchFilters, Pagination } from '@/lib/types';
import type { Metadata } from 'next';

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
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
    ownershipRaw === 'public' || ownershipRaw === 'private'
      ? ownershipRaw
      : null;

  const lat =
    typeof raw['lat'] === 'string' ? parseFloat(raw['lat']) : undefined;
  const lng =
    typeof raw['lng'] === 'string' ? parseFloat(raw['lng']) : undefined;
  const radius =
    typeof raw['radius'] === 'string' ? parseFloat(raw['radius']) : null;

  const hasGeolocation =
    lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng);

  const sortRaw = raw['sort'];
  const sortBy: 'name' | 'rating' | 'distance' =
    sortRaw === 'rating' || sortRaw === 'distance' ? sortRaw : 'name';

  const page =
    typeof raw['page'] === 'string'
      ? Math.max(1, parseInt(raw['page'], 10))
      : 1;

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

export default function SearchPage({ searchParams }: SearchPageProps) {
  const { query, filters, pagination, sortBy, hasGeolocation } =
    parseSearchParams(searchParams);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <Suspense>
            <SearchBar defaultValue={query} />
          </Suspense>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filter sidebar — desktop */}
          <div className="hidden md:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
              <Suspense>
                <FilterPanel />
              </Suspense>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter disclosure */}
            <div className="md:hidden mb-4">
              <Suspense>
                <FilterPanel mobile />
              </Suspense>
            </div>

            <SignUpBanner />

            <Suspense fallback={<ResultsListSkeleton />}>
              <SearchResults
                query={query}
                filters={filters}
                pagination={pagination}
                sortBy={sortBy}
                hasGeolocation={hasGeolocation}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { searchHospitals } from '@/lib/supabase/queries';
import { ResultsList } from '@/components/search/ResultsList';
import { MapToggle } from '@/components/search/MapToggle';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import type { SearchFilters, Pagination } from '@/lib/types';

interface SearchResultsProps {
  query: string;
  filters: SearchFilters;
  pagination: Pagination;
  sortBy: 'name' | 'rating' | 'distance';
  hasGeolocation: boolean;
}

export async function SearchResults({
  query,
  filters,
  pagination,
  sortBy,
  hasGeolocation,
}: SearchResultsProps) {
  const supabase = createClient();
  const hospitals = await searchHospitals(supabase, query, filters, pagination, sortBy);

  return (
    <>
      <MapToggle
        hospitals={hospitals}
        userLocation={
          filters.lat != null && filters.lng != null
            ? [filters.lng, filters.lat]
            : null
        }
        radiusKm={filters.radius}
      />
      <ErrorBoundary>
        <ResultsList hospitals={hospitals} hasGeolocation={hasGeolocation} query={query} />
      </ErrorBoundary>
    </>
  );
}

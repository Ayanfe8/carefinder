import type { FilterState } from './types';

export type { FilterState };

// Builds a fully-qualified shareable URL from the current filter state.
// Opening this URL server-side (SSR) reproduces the same results with no
// client-side flash — all params are read from searchParams in the page component.
export function encodeFilters(
  filters: FilterState,
  siteUrl: string
): string {
  const params = new URLSearchParams();

  if (filters.q?.trim()) params.set('q', filters.q.trim());
  if (filters.city?.trim()) params.set('city', filters.city.trim());
  if (filters.specialty?.length) {
    for (const s of filters.specialty) params.append('specialty', s);
  }
  if (filters.ownership) params.set('ownership', filters.ownership);
  if (filters.radius != null) params.set('radius', String(filters.radius));

  const qs = params.toString();
  return `${siteUrl}/search${qs ? `?${qs}` : ''}`;
}

// Reconstructs a FilterState from Next.js searchParams (server component) or
// URLSearchParams (client component). Both share the same logic.
export function decodeFilters(
  params: URLSearchParams | Record<string, string | string[] | undefined>
): FilterState {
  if (params instanceof URLSearchParams) {
    return {
      q: params.get('q') ?? undefined,
      city: params.get('city') ?? undefined,
      specialty: params.getAll('specialty').filter(Boolean),
      ownership: (params.get('ownership') as FilterState['ownership']) ?? null,
      radius: params.has('radius') ? Number(params.get('radius')) : null,
    };
  }

  // Record form — from Next.js page `searchParams` prop
  const specialty = params['specialty'];
  return {
    q: typeof params['q'] === 'string' ? params['q'] : undefined,
    city: typeof params['city'] === 'string' ? params['city'] : undefined,
    specialty: Array.isArray(specialty)
      ? specialty
      : specialty
        ? [specialty]
        : [],
    ownership:
      typeof params['ownership'] === 'string'
        ? (params['ownership'] as FilterState['ownership'])
        : null,
    radius:
      typeof params['radius'] === 'string' ? Number(params['radius']) : null,
  };
}

// Returns true when two FilterState objects represent identical search params.
export function filtersEqual(a: FilterState, b: FilterState): boolean {
  return (
    (a.q ?? '') === (b.q ?? '') &&
    (a.city ?? '') === (b.city ?? '') &&
    [...(a.specialty ?? [])].sort().join(',') ===
      [...(b.specialty ?? [])].sort().join(',') &&
    (a.ownership ?? null) === (b.ownership ?? null) &&
    (a.radius ?? null) === (b.radius ?? null)
  );
}

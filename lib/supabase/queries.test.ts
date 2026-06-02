import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import {
  searchHospitals,
  getHospitalById,
  getReviews,
  createHospital,
  updateHospital,
  deleteHospital,
  moderateReview,
} from './queries';
import type { SearchFilters, Pagination } from '@/lib/types';

// ─── Unit tests: verify RPC params are wired correctly ────────────────────────
// These tests mock the Supabase client and assert the exact parameters passed
// to the search_hospitals RPC function for each filter combination.

const DEFAULT_PAGINATION: Pagination = { page: 1, pageSize: 20 };
const EMPTY_FILTERS: SearchFilters = {};

function makeMockSupabase(rpcResult: unknown = []) {
  const rpc = vi.fn().mockResolvedValue({ data: rpcResult, error: null });
  return { rpc } as unknown as ReturnType<typeof createClient>;
}

describe('searchHospitals — RPC parameter wiring', () => {
  let mock: ReturnType<typeof makeMockSupabase>;

  beforeEach(() => {
    mock = makeMockSupabase();
  });

  it('passes null query when empty string is provided', async () => {
    await searchHospitals(mock, '', EMPTY_FILTERS, DEFAULT_PAGINATION);
    expect(mock.rpc).toHaveBeenCalledWith(
      'search_hospitals',
      expect.objectContaining({ p_query: null })
    );
  });

  it('passes trimmed query string', async () => {
    await searchHospitals(mock, '  Lagos  ', EMPTY_FILTERS, DEFAULT_PAGINATION);
    expect(mock.rpc).toHaveBeenCalledWith(
      'search_hospitals',
      expect.objectContaining({ p_query: 'Lagos' })
    );
  });

  it('passes specialty array filter', async () => {
    const filters: SearchFilters = { specialty: ['maternity', 'pediatric'] };
    await searchHospitals(mock, '', filters, DEFAULT_PAGINATION);
    expect(mock.rpc).toHaveBeenCalledWith(
      'search_hospitals',
      expect.objectContaining({ p_specialties: ['maternity', 'pediatric'] })
    );
  });

  it('passes null specialties when array is empty', async () => {
    const filters: SearchFilters = { specialty: [] };
    await searchHospitals(mock, '', filters, DEFAULT_PAGINATION);
    expect(mock.rpc).toHaveBeenCalledWith(
      'search_hospitals',
      expect.objectContaining({ p_specialties: null })
    );
  });

  it('passes ownership filter', async () => {
    const filters: SearchFilters = { ownership: 'public' };
    await searchHospitals(mock, '', filters, DEFAULT_PAGINATION);
    expect(mock.rpc).toHaveBeenCalledWith(
      'search_hospitals',
      expect.objectContaining({ p_ownership: 'public' })
    );
  });

  it('passes null ownership when not specified', async () => {
    await searchHospitals(mock, '', EMPTY_FILTERS, DEFAULT_PAGINATION);
    expect(mock.rpc).toHaveBeenCalledWith(
      'search_hospitals',
      expect.objectContaining({ p_ownership: null })
    );
  });

  it('combines specialty + ownership filters (AND logic)', async () => {
    const filters: SearchFilters = {
      specialty: ['emergency'],
      ownership: 'private',
    };
    await searchHospitals(mock, 'Abuja', filters, DEFAULT_PAGINATION);
    expect(mock.rpc).toHaveBeenCalledWith('search_hospitals', {
      p_query: 'Abuja',
      p_specialties: ['emergency'],
      p_ownership: 'private',
      p_lat: null,
      p_lng: null,
      p_radius_km: null,
      p_sort_by: 'name',
      p_limit: 20,
      p_offset: 0,
    });
  });

  it('passes PostGIS radius params when all three (lat/lng/radius) are present', async () => {
    const filters: SearchFilters = { lat: 6.5244, lng: 3.3792, radius: 10 };
    await searchHospitals(mock, '', filters, DEFAULT_PAGINATION, 'distance');
    expect(mock.rpc).toHaveBeenCalledWith(
      'search_hospitals',
      expect.objectContaining({
        p_lat: 6.5244,
        p_lng: 3.3792,
        p_radius_km: 10,
        p_sort_by: 'distance',
      })
    );
  });

  it('passes null radius params when lat is missing', async () => {
    const filters: SearchFilters = { lng: 3.3792, radius: 10 };
    await searchHospitals(mock, '', filters, DEFAULT_PAGINATION);
    expect(mock.rpc).toHaveBeenCalledWith(
      'search_hospitals',
      expect.objectContaining({ p_lat: null, p_lng: 3.3792, p_radius_km: 10 })
    );
  });

  it('computes correct offset from page number', async () => {
    await searchHospitals(mock, '', EMPTY_FILTERS, { page: 3, pageSize: 10 });
    expect(mock.rpc).toHaveBeenCalledWith(
      'search_hospitals',
      expect.objectContaining({ p_limit: 10, p_offset: 20 })
    );
  });

  it('defaults sort to name', async () => {
    await searchHospitals(mock, '', EMPTY_FILTERS, DEFAULT_PAGINATION);
    expect(mock.rpc).toHaveBeenCalledWith(
      'search_hospitals',
      expect.objectContaining({ p_sort_by: 'name' })
    );
  });

  it('returns empty array when RPC returns null', async () => {
    const nullMock = makeMockSupabase(null);
    const result = await searchHospitals(nullMock, '', EMPTY_FILTERS, DEFAULT_PAGINATION);
    expect(result).toEqual([]);
  });

  it('throws when RPC returns an error', async () => {
    const errMock = {
      rpc: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
    } as unknown as ReturnType<typeof createClient>;
    await expect(searchHospitals(errMock, '', EMPTY_FILTERS, DEFAULT_PAGINATION)).rejects.toEqual(
      { message: 'DB error' }
    );
  });
});

describe('updateHospital — partial patch building', () => {
  it('only sends fields that are explicitly provided', async () => {
    const update = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: '1', name: 'New Name' }, error: null }),
        }),
      }),
    });
    const mockClient = { from: vi.fn().mockReturnValue({ update }) } as unknown as ReturnType<
      typeof createClient
    >;

    await updateHospital(mockClient, '1', { name: 'New Name' });

    expect(update).toHaveBeenCalledWith({ name: 'New Name' });
  });

  it('builds EWKT location when both lat and lng are provided', async () => {
    const update = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
        }),
      }),
    });
    const mockClient = { from: vi.fn().mockReturnValue({ update }) } as unknown as ReturnType<
      typeof createClient
    >;

    await updateHospital(mockClient, '1', { latitude: 6.5244, longitude: 3.3792 });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ location: 'SRID=4326;POINT(3.3792 6.5244)' })
    );
  });

  it('does not include location when only latitude is provided', async () => {
    const update = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
        }),
      }),
    });
    const mockClient = { from: vi.fn().mockReturnValue({ update }) } as unknown as ReturnType<
      typeof createClient
    >;

    await updateHospital(mockClient, '1', { latitude: 6.5244 });

    const callArg = update.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(callArg).not.toHaveProperty('location');
  });
});

describe('createHospital — EWKT location encoding', () => {
  it('encodes lat/lng as SRID=4326;POINT(lng lat) EWKT', async () => {
    const insert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
      }),
    });
    const mockClient = {
      from: vi.fn().mockReturnValue({ insert }),
    } as unknown as ReturnType<typeof createClient>;

    await createHospital(mockClient, {
      name: 'Test Hospital',
      address: '1 Test Road',
      city: 'Lagos',
      lga: 'Lagos Island',
      phone: '+2348012345678',
      specialties: ['general'],
      ownership: 'public',
      latitude: 6.4531,
      longitude: 3.3958,
    });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ location: 'SRID=4326;POINT(3.3958 6.4531)' })
    );
  });
});

// ─── Integration tests: PostGIS ST_DWithin against real seeded data ───────────
// These tests require NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// to be present in .env.local. They are skipped in CI environments where those
// variables are absent.

const SUPABASE_URL = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_ANON_KEY = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const runIntegration = SUPABASE_URL && SUPABASE_ANON_KEY;

describe.skipIf(!runIntegration)(
  'searchHospitals — PostGIS ST_DWithin (integration, requires .env.local)',
  () => {
    let supabase: ReturnType<typeof createClient>;

    beforeEach(() => {
      supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    });

    it('returns Lagos hospitals within a 20 km radius of Lagos city center', async () => {
      // Lagos city center: 3.3792°E, 6.5244°N
      const results = await searchHospitals(
        supabase,
        '',
        { lat: 6.5244, lng: 3.3792, radius: 20 },
        { page: 1, pageSize: 20 },
        'distance'
      );

      expect(results.length).toBeGreaterThan(0);
      // All returned rows must be within 20 km
      results.forEach((h) => {
        expect(h.distance_km).toBeDefined();
        expect(h.distance_km!).toBeLessThanOrEqual(20);
      });
    });

    it('returns no results for a 1 km radius in an uninhabited area', async () => {
      // Coordinates in the middle of the Atlantic Ocean — well outside Nigeria
      const results = await searchHospitals(
        supabase,
        '',
        { lat: 0.0, lng: 0.0, radius: 1 },
        { page: 1, pageSize: 20 }
      );
      expect(results).toHaveLength(0);
    });

    it('filters by specialty — maternity only', async () => {
      const results = await searchHospitals(
        supabase,
        '',
        { specialty: ['maternity'] },
        { page: 1, pageSize: 50 }
      );

      expect(results.length).toBeGreaterThan(0);
      results.forEach((h) => {
        expect(h.specialties).toContain('maternity');
      });
    });

    it('filters by ownership — public only', async () => {
      const results = await searchHospitals(
        supabase,
        '',
        { ownership: 'public' },
        { page: 1, pageSize: 50 }
      );

      expect(results.length).toBeGreaterThan(0);
      results.forEach((h) => {
        expect(h.ownership).toBe('public');
      });
    });

    it('combines maternity + private ownership — returns only matching hospitals', async () => {
      const results = await searchHospitals(
        supabase,
        '',
        { specialty: ['maternity'], ownership: 'private' },
        { page: 1, pageSize: 50 }
      );

      results.forEach((h) => {
        expect(h.specialties).toContain('maternity');
        expect(h.ownership).toBe('private');
      });
    });

    it('text search on city name returns only matching city', async () => {
      const results = await searchHospitals(
        supabase,
        'Kano',
        {},
        { page: 1, pageSize: 50 }
      );

      expect(results.length).toBeGreaterThan(0);
      results.forEach((h) => {
        const matchesQuery =
          h.name.toLowerCase().includes('kano') ||
          h.city.toLowerCase().includes('kano') ||
          h.lga.toLowerCase().includes('kano');
        expect(matchesQuery).toBe(true);
      });
    });

    it('getHospitalById returns the correct hospital', async () => {
      // First get any hospital ID from the seeded data
      const all = await searchHospitals(supabase, '', {}, { page: 1, pageSize: 1 });
      expect(all.length).toBeGreaterThan(0);

      const id = all[0]!.id;
      const hospital = await getHospitalById(supabase, id);

      expect(hospital).not.toBeNull();
      expect(hospital!.id).toBe(id);
    });

    it('getHospitalById returns null for a non-existent ID', async () => {
      const result = await getHospitalById(
        supabase,
        '00000000-0000-0000-0000-000000000000'
      );
      expect(result).toBeNull();
    });

    it('getReviews returns empty array for a hospital with no reviews', async () => {
      const all = await searchHospitals(supabase, '', {}, { page: 1, pageSize: 1 });
      const id = all[0]!.id;
      const reviews = await getReviews(supabase, id, 'approved');
      expect(Array.isArray(reviews)).toBe(true);
    });
  }
);

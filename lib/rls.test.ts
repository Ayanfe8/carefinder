/**
 * RLS verification — confirms that anonymous (unauthenticated) clients
 * cannot write to the hospitals table. Tests run against whichever
 * Supabase instance is configured in .env.local.
 *
 * Skipped automatically when env vars are absent (CI without secrets).
 */
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const hasEnv = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Payload that satisfies all NOT NULL columns — we want the INSERT to reach
// the RLS policy check, not fail earlier on a constraint violation.
const RLS_TEST_PAYLOAD = {
  name: '__rls_anon_test__',
  address: '1 RLS Test Street',
  city: 'Lagos',
  lga: 'Lagos Island',
  phone: '+2348000000000',
  specialties: ['general'],
  ownership: 'public',
  // PostGIS location as WKT — required column in the schema
  location: 'SRID=4326;POINT(3.3841 6.4550)',
  status: 'published',
  rating_avg: 0,
  review_count: 0,
};

describe.skipIf(!hasEnv)('RLS: anonymous writes are rejected', () => {
  // Fresh client with no session — purely anonymous
  const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  it('rejects anonymous INSERT into hospitals (code 42501)', async () => {
    const { data, error } = await anon
      .from('hospitals')
      .insert(RLS_TEST_PAYLOAD)
      .select('id')
      .single();

    expect(data).toBeNull();
    expect(error).not.toBeNull();
    // PostgreSQL RLS violation code
    expect(error!.code).toBe('42501');
  });

  it('rejects anonymous UPDATE on hospitals', async () => {
    const { error } = await anon
      .from('hospitals')
      .update({ name: '__rls_hacked__' })
      // target a name that definitely does not exist — RLS fires before row scan
      .eq('name', '__rls_anon_test__');

    expect(error).not.toBeNull();
    expect(error!.code).toBe('42501');
  });

  it('rejects anonymous DELETE on hospitals', async () => {
    const { error } = await anon
      .from('hospitals')
      .delete()
      .eq('name', '__rls_anon_test__');

    expect(error).not.toBeNull();
    expect(error!.code).toBe('42501');
  });

  it('allows anonymous SELECT of published hospitals (public read)', async () => {
    const { data, error } = await anon
      .from('hospitals')
      .select('id, name, status')
      .eq('status', 'published')
      .limit(1);

    // SELECT should succeed — hospitals are publicly readable
    expect(error).toBeNull();
    // data may be an empty array if no seeded hospitals, but never null
    expect(data).not.toBeNull();
  });
});

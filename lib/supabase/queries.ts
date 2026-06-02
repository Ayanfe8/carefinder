import type { SupabaseClient } from '@supabase/supabase-js'
import type { Hospital, Review, SearchFilters, Pagination } from '@/lib/types'
import type { HospitalInput } from '@/lib/schemas'

// All hospital columns except `location` (PostGIS GEOGRAPHY — binary, not useful in JS)
const HOSPITAL_COLS =
  'id, name, address, city, lga, phone, email, specialties, ownership, ' +
  'description_md, visiting_hours, rating_avg, review_count, status, created_by, created_at'

const REVIEW_COLS = 'id, hospital_id, user_id, rating, text, status, created_at'

// ─── Public queries ────────────────────────────────────────────────────────────

/**
 * Fetch a single published hospital by ID.
 * Returns null when not found or not published.
 * Used by the ISR detail page.
 */
export async function getHospitalById(
  supabase: SupabaseClient,
  id: string
): Promise<Hospital | null> {
  const { data, error } = await supabase
    .from('hospitals')
    .select(HOSPITAL_COLS)
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw error
  return data as unknown as Hospital | null
}

/**
 * Full-text + PostGIS search via the search_hospitals RPC function.
 *
 * Combines:
 *   - Text match on name, city, LGA (ILIKE)
 *   - Specialty array overlap (&&)
 *   - Ownership filter
 *   - PostGIS ST_DWithin radius filter (when lat/lng/radius all provided)
 *
 * distance_km is populated on each result when lat/lng are present.
 *
 * Note: ISR revalidation after mutations is the caller's responsibility
 * (handled by the admin form component in Phase 3).
 */
export async function searchHospitals(
  supabase: SupabaseClient,
  query: string,
  filters: SearchFilters,
  pagination: Pagination,
  sortBy: 'name' | 'rating' | 'distance' = 'name'
): Promise<Hospital[]> {
  const { data, error } = await supabase.rpc('search_hospitals', {
    p_query: query.trim() || null,
    p_specialties: filters.specialty?.length ? filters.specialty : null,
    p_ownership: filters.ownership ?? null,
    p_lat: filters.lat ?? null,
    p_lng: filters.lng ?? null,
    p_radius_km: filters.radius ?? null,
    p_sort_by: sortBy,
    p_limit: pagination.pageSize,
    p_offset: (pagination.page - 1) * pagination.pageSize,
  })

  if (error) throw error
  return (data ?? []) as unknown as Hospital[]
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

/**
 * Fetch reviews for a hospital.
 * - Public callers (anon/authenticated client): RLS limits results to approved only.
 * - Admin callers (service role client): all statuses returned.
 * Pass an explicit `status` to override (admin-only for non-approved statuses).
 */
export async function getReviews(
  supabase: SupabaseClient,
  hospitalId: string,
  status?: 'approved' | 'hidden' | 'pending'
): Promise<Review[]> {
  let q = supabase
    .from('reviews')
    .select(REVIEW_COLS)
    .eq('hospital_id', hospitalId)
    .order('created_at', { ascending: false })

  if (status) {
    q = q.eq('status', status)
  }

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Review[]
}

/**
 * Submit a review for a hospital. Requires an authenticated session.
 * The Postgres trigger in migration 006 automatically updates
 * hospitals.rating_avg and hospitals.review_count on INSERT.
 */
export async function submitReview(
  supabase: SupabaseClient,
  hospitalId: string,
  rating: number,
  text?: string
): Promise<Review> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Must be signed in to submit a review')

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      hospital_id: hospitalId,
      user_id: user.id,
      rating,
      text: text ?? null,
    })
    .select(REVIEW_COLS)
    .single()

  if (error) throw error
  return data as unknown as Review
}

// ─── Admin mutations ──────────────────────────────────────────────────────────
// These require either:
//   - A cookie-based client with a JWT that has role = 'admin' (RLS enforced), or
//   - A service role client (bypasses RLS — use in trusted server contexts only).
// Callers are responsible for calling POST /api/revalidate after create/update.

/**
 * Create a new published hospital entry.
 * location is stored as PostGIS GEOGRAPHY using EWKT passed via PostgREST.
 */
export async function createHospital(
  supabase: SupabaseClient,
  input: HospitalInput
): Promise<Hospital> {
  const { data, error } = await supabase
    .from('hospitals')
    .insert({
      name: input.name,
      address: input.address,
      city: input.city,
      lga: input.lga,
      phone: input.phone,
      email: input.email || null,
      specialties: input.specialties,
      ownership: input.ownership,
      description_md: input.description_md ?? null,
      visiting_hours: input.visiting_hours ?? null,
      status: 'published',
      // EWKT format: PostgREST casts this to GEOGRAPHY(POINT, 4326)
      location: `SRID=4326;POINT(${input.longitude} ${input.latitude})`,
    })
    .select(HOSPITAL_COLS)
    .single()

  if (error) throw error
  return data as unknown as Hospital
}

/**
 * Partially update a hospital entry. Only fields present in `input` are patched.
 * location is only updated when both latitude and longitude are provided.
 */
export async function updateHospital(
  supabase: SupabaseClient,
  id: string,
  input: Partial<HospitalInput>
): Promise<Hospital> {
  const patch: Record<string, unknown> = {}

  if (input.name !== undefined) patch.name = input.name
  if (input.address !== undefined) patch.address = input.address
  if (input.city !== undefined) patch.city = input.city
  if (input.lga !== undefined) patch.lga = input.lga
  if (input.phone !== undefined) patch.phone = input.phone
  if (input.email !== undefined) patch.email = input.email || null
  if (input.specialties !== undefined) patch.specialties = input.specialties
  if (input.ownership !== undefined) patch.ownership = input.ownership
  if (input.description_md !== undefined) patch.description_md = input.description_md ?? null
  if (input.visiting_hours !== undefined) patch.visiting_hours = input.visiting_hours ?? null
  if (input.latitude !== undefined && input.longitude !== undefined) {
    patch.location = `SRID=4326;POINT(${input.longitude} ${input.latitude})`
  }

  const { data, error } = await supabase
    .from('hospitals')
    .update(patch)
    .eq('id', id)
    .select(HOSPITAL_COLS)
    .single()

  if (error) throw error
  return data as unknown as Hospital
}

/**
 * Delete a hospital by ID.
 * FK ON DELETE CASCADE removes all associated hospital_images and reviews.
 */
export async function deleteHospital(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from('hospitals').delete().eq('id', id)
  if (error) throw error
}

/**
 * Approve or hide a review. Admin-only.
 * Use a service role client — the SELECT RLS policy only returns approved rows,
 * so the RETURNING clause after updating to 'hidden' would silently return nothing
 * with a regular client.
 */
export async function moderateReview(
  supabase: SupabaseClient,
  reviewId: string,
  status: 'approved' | 'hidden'
): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', reviewId)
    .select(REVIEW_COLS)
    .single()

  if (error) throw error
  return data as unknown as Review
}

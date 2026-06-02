export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  lga: string;
  phone: string;
  email: string | null;
  specialties: string[];
  ownership: 'public' | 'private';
  description_md: string | null;
  visiting_hours: string | null;
  rating_avg: number;
  review_count: number;
  status: 'draft' | 'pending_review' | 'published';
  created_by: string | null;
  created_at: string;
  // Computed by PostGIS ST_Distance — present only when radius search is active
  distance_km?: number;
}

export interface Review {
  id: string;
  hospital_id: string;
  user_id: string | null;
  rating: number;
  text: string | null;
  status: 'approved' | 'hidden' | 'pending';
  created_at: string;
}

export interface HospitalImage {
  id: string;
  hospital_id: string;
  storage_path: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface FilterState {
  q?: string;
  city?: string;
  specialty?: string[];
  ownership?: 'public' | 'private' | null;
  radius?: number | null;
}

export interface SearchFilters extends FilterState {
  lat?: number;
  lng?: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
}

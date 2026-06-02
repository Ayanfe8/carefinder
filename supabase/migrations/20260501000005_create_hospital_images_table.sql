-- Migration 005: Create hospital_images table
-- Stores references to hospital photos uploaded to Supabase Storage.
-- Actual files live in the hospital-images storage bucket.
-- storage_path references the file path within the bucket.

CREATE TABLE public.hospital_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id  UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  uploaded_by  UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.hospital_images ENABLE ROW LEVEL SECURITY;

-- Public can read all image records
CREATE POLICY "hospital_images_read_all"
  ON public.hospital_images
  FOR SELECT
  USING (true);

-- Admin only insert
CREATE POLICY "hospital_images_admin_insert"
  ON public.hospital_images
  FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Admin only delete
CREATE POLICY "hospital_images_admin_delete"
  ON public.hospital_images
  FOR DELETE
  USING (auth.jwt()->>'role' = 'admin');
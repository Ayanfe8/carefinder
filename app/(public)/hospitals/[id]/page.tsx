import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getHospitalById, getReviews } from '@/lib/supabase/queries';
import { HospitalDetail } from '@/components/hospital/HospitalDetail';
import type { Metadata } from 'next';
import type { HospitalImage } from '@/lib/types';

// ISR: serve statically, revalidate at most every 60 seconds.
// Cache is busted immediately by POST /api/revalidate after any admin save.
export const revalidate = 60;

interface HospitalPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: HospitalPageProps): Promise<Metadata> {
  const supabase = createClient();
  const hospital = await getHospitalById(supabase, params.id);
  if (!hospital) return { title: 'Hospital Not Found' };
  return {
    title: hospital.name,
    description: `${hospital.name} — ${hospital.address}, ${hospital.city}. Specialties: ${hospital.specialties.join(', ')}.`,
  };
}

export default async function HospitalPage({ params }: HospitalPageProps) {
  const supabase = createClient();

  const [hospital, reviews] = await Promise.all([
    getHospitalById(supabase, params.id),
    getReviews(supabase, params.id, 'approved'),
  ]);

  if (!hospital) notFound();

  // Fetch images from the hospital_images table
  const { data: imagesData } = await supabase
    .from('hospital_images')
    .select('id, hospital_id, storage_path, uploaded_by, created_at')
    .eq('hospital_id', params.id)
    .order('created_at', { ascending: true });

  const images = (imagesData ?? []) as HospitalImage[];

  return <HospitalDetail hospital={hospital} images={images} reviews={reviews} />;
}

'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';
import {
  createHospital,
  updateHospital,
  deleteHospital,
  moderateReview,
} from '@/lib/supabase/queries';
import type { HospitalInput } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

export async function createHospitalAction(
  input: HospitalInput
): Promise<{ id: string }> {
  const supabase = createServiceClient();
  const hospital = await createHospital(supabase, input);
  revalidatePath(`/hospitals/${hospital.id}`);
  revalidatePath('/admin/dashboard');
  return { id: hospital.id };
}

export async function updateHospitalAction(
  id: string,
  input: HospitalInput
): Promise<{ id: string }> {
  const supabase = createServiceClient();
  await updateHospital(supabase, id, input);
  revalidatePath(`/hospitals/${id}`);
  revalidatePath('/admin/dashboard');
  return { id };
}

export async function moderateReviewAction(formData: FormData) {
  const reviewId = formData.get('reviewId') as string;
  const status = formData.get('status') as 'approved' | 'hidden';
  if (!reviewId || !status) return;

  const supabase = createServiceClient();
  await moderateReview(supabase, reviewId, status);
  revalidatePath('/admin/reviews');
}

export async function deleteHospitalAction(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  const supabase = createServiceClient();
  await deleteHospital(supabase, id);

  revalidatePath(`/hospitals/${id}`);
  revalidatePath('/admin/dashboard');
  redirect('/admin/dashboard');
}

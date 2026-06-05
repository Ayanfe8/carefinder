'use server';

import { createClient } from '@/lib/supabase/server';
import { deleteHospital } from '@/lib/supabase/queries';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

export async function deleteHospitalAction(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  const supabase = createClient();
  await deleteHospital(supabase, id);

  // Bust the ISR cache for the deleted hospital's public detail page.
  revalidatePath(`/hospitals/${id}`);
  revalidatePath('/admin/dashboard');
  redirect('/admin/dashboard');
}

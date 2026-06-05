import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { getHospitalByIdAdmin } from '@/lib/supabase/queries';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminEntryForm } from '@/components/admin/AdminEntryForm';

interface Props {
  params: { id: string };
}

export default async function EditHospitalPage({ params }: Props) {
  const supabase = createServiceClient();
  const hospital = await getHospitalByIdAdmin(supabase, params.id);

  if (!hospital) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Hospital</h1>
        <AdminEntryForm hospital={hospital} />
      </main>
    </div>
  );
}

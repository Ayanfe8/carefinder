import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { getAdminHospitals } from '@/lib/supabase/queries';
import { deleteHospitalAction } from '@/app/admin/actions';
import { AdminHeader } from '@/components/admin/AdminHeader';
import type { Hospital } from '@/lib/types';
import { Plus } from 'lucide-react';

const PAGE_SIZE = 20;

interface Props {
  searchParams: { page?: string };
}

export default async function AdminDashboardPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10));
  const supabase = createServiceClient();
  const { hospitals, total } = await getAdminHospitals(supabase, {
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />

      <main className="ml-64 px-8 py-8">
        <div className="max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Hospitals</h1>
              <div className="mt-2 h-1 w-16 bg-blue-700 rounded"></div>
            </div>
            <Link
              href="/admin/hospitals/new"
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors duration-150 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Hospital
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-8">
            <p className="text-sm text-slate-600">
              Total hospitals: <span className="font-semibold text-slate-900">{total}</span>
            </p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-6 py-4 font-semibold text-slate-600 uppercase text-xs">Name</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 uppercase text-xs">City</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 uppercase text-xs text-center">Specs</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 uppercase text-xs">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 uppercase text-xs">Created</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 uppercase text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {hospitals.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{h.name}</td>
                    <td className="px-6 py-4 text-slate-600">{h.city}</td>
                    <td className="px-6 py-4 text-slate-600 text-center">
                      {h.specialties.length}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={h.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(h.created_at).toLocaleDateString('en-NG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/hospitals/${h.id}/edit`}
                          className="text-blue-700 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </Link>
                        <form action={deleteHospitalAction}>
                          <input type="hidden" name="id" value={h.id} />
                          <button
                            type="submit"
                            className="text-red-500 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {hospitals.length === 0 && (
              <div className="px-6 py-16 text-center">
                <p className="text-slate-500 mb-4">No hospitals yet.</p>
                <Link
                  href="/admin/hospitals/new"
                  className="text-blue-700 hover:text-blue-800 font-medium"
                >
                  Add the first one →
                </Link>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/dashboard?page=${page - 1}`}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/dashboard?page=${page + 1}`}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: Hospital['status'] }) {
  const styles: Record<Hospital['status'], string> = {
    published: 'bg-green-100 text-green-800 border border-green-200',
    draft: 'bg-slate-100 text-slate-700 border border-slate-200',
    pending_review: 'bg-amber-100 text-amber-800 border border-amber-200',
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

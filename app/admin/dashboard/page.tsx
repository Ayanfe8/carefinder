import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getAdminHospitals } from '@/lib/supabase/queries';
import { deleteHospitalAction } from '@/app/admin/actions';
import { AdminHeader } from '@/components/admin/AdminHeader';
import type { Hospital } from '@/lib/types';

const PAGE_SIZE = 20;

interface Props {
  searchParams: { page?: string };
}

export default async function AdminDashboardPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10));
  const supabase = createClient();
  const { hospitals, total } = await getAdminHospitals(supabase, {
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hospitals</h1>
            <p className="text-sm text-gray-500 mt-1">{total} total</p>
          </div>
          <Link
            href="/admin/hospitals/new"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Add Hospital
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 font-medium text-gray-500">City</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-center">Specialties</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Created</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {hospitals.map((h) => (
                <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{h.name}</td>
                  <td className="px-4 py-3 text-gray-600">{h.city}</td>
                  <td className="px-4 py-3 text-gray-600 text-center">
                    {h.specialties.length}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={h.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(h.created_at).toLocaleDateString('en-NG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/hospitals/${h.id}/edit`}
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
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
            <div className="px-4 py-16 text-center text-gray-400 text-sm">
              No hospitals yet.{' '}
              <Link
                href="/admin/hospitals/new"
                className="text-emerald-600 hover:underline"
              >
                Add one →
              </Link>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/dashboard?page=${page - 1}`}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/dashboard?page=${page + 1}`}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: Hospital['status'] }) {
  const styles: Record<Hospital['status'], string> = {
    published: 'bg-green-50 text-green-700',
    draft: 'bg-gray-100 text-gray-600',
    pending_review: 'bg-yellow-50 text-yellow-700',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

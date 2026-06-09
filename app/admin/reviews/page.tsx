import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ReviewModerationRow, type ReviewWithRelations } from '@/components/admin/ReviewModerationRow';

const PAGE_SIZE = 20;

interface Props {
  searchParams: { page?: string };
}

export default async function AdminReviewsPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10));
  const supabase = createServiceClient();

  const { data, error, count } = await supabase
    .from('reviews')
    .select('*, hospitals ( name )', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (error) throw error;

  const reviews = (data ?? []) as unknown as ReviewWithRelations[];
  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="ml-64 px-8 py-8">
        <div className="max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
            <div className="mt-2 h-1 w-16 bg-green-600 rounded"></div>
            <p className="text-sm text-gray-500 mt-2">{total} total reviews</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-6 py-4 font-semibold text-gray-700">Hospital</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Reviewer</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Rating</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Review</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviews.map((review) => (
                  <ReviewModerationRow key={review.id} review={review} />
                ))}
              </tbody>
            </table>

            {reviews.length === 0 && (
              <div className="px-6 py-16 text-center text-gray-500">
                No reviews yet.
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/reviews?page=${page - 1}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/reviews?page=${page + 1}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
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

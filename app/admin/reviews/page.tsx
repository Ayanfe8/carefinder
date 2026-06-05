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
    .select(
      `id, hospital_id, user_id, rating, text, status, created_at,
       hospitals ( name ),
       users ( email )`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (error) throw error;

  const reviews = (data ?? []) as unknown as ReviewWithRelations[];
  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">Hospital</th>
                <th className="px-4 py-3 font-medium text-gray-500">Reviewer</th>
                <th className="px-4 py-3 font-medium text-gray-500">Rating</th>
                <th className="px-4 py-3 font-medium text-gray-500">Review</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reviews.map((review) => (
                <ReviewModerationRow key={review.id} review={review} />
              ))}
            </tbody>
          </table>

          {reviews.length === 0 && (
            <div className="px-4 py-16 text-center text-gray-400 text-sm">
              No reviews yet.
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
                  href={`/admin/reviews?page=${page - 1}`}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/reviews?page=${page + 1}`}
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

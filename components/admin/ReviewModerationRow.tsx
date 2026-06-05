import { moderateReviewAction } from '@/app/admin/actions';

export type ReviewWithRelations = {
  id: string;
  hospital_id: string;
  user_id: string | null;
  rating: number;
  text: string | null;
  status: 'approved' | 'hidden' | 'pending';
  created_at: string;
  hospitals: { name: string } | null;
  users: { email: string } | null;
};

interface Props {
  review: ReviewWithRelations;
}

const STATUS_STYLES: Record<ReviewWithRelations['status'], string> = {
  approved: 'bg-green-50 text-green-700',
  hidden: 'bg-red-50 text-red-600',
  pending: 'bg-yellow-50 text-yellow-700',
};

export function ReviewModerationRow({ review }: Props) {
  const hospitalName = review.hospitals?.name ?? 'Unknown hospital';
  const reviewerEmail = review.users?.email ?? 'Anonymous';
  const date = new Date(review.created_at).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <tr className="hover:bg-gray-50 transition-colors align-top">
      <td className="px-4 py-3 font-medium text-gray-900 max-w-[160px] truncate">
        {hospitalName}
      </td>
      <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate" title={reviewerEmail}>
        {reviewerEmail}
        <span className="block text-xs text-gray-400">{date}</span>
      </td>
      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
        {'★'.repeat(review.rating)}
        {'☆'.repeat(5 - review.rating)}
      </td>
      <td className="px-4 py-3 text-gray-600 max-w-xs">
        <p className="line-clamp-2">{review.text ?? <em className="text-gray-400">No text</em>}</p>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[review.status]}`}
        >
          {review.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <form action={moderateReviewAction}>
            <input type="hidden" name="reviewId" value={review.id} />
            <input type="hidden" name="status" value="approved" />
            <button
              type="submit"
              disabled={review.status === 'approved'}
              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Approve
            </button>
          </form>
          <form action={moderateReviewAction}>
            <input type="hidden" name="reviewId" value={review.id} />
            <input type="hidden" name="status" value="hidden" />
            <button
              type="submit"
              disabled={review.status === 'hidden'}
              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Hide
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}

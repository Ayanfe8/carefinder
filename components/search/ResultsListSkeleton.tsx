export function ResultsListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading results">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-36 bg-gray-200 animate-pulse rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-lg" />
          <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-lg" />
        </div>
      </div>
      <ul className="space-y-3" role="list">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2.5">
                <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
                <div className="flex gap-2 mt-2">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-10 bg-gray-200 animate-pulse rounded" />
                  <div className="h-5 w-14 bg-gray-200 animate-pulse rounded-full" />
                </div>
                <div className="flex gap-1.5 pt-0.5">
                  <div className="h-5 w-20 bg-gray-100 animate-pulse rounded-full" />
                  <div className="h-5 w-16 bg-gray-100 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

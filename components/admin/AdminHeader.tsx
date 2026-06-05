import Link from 'next/link';
import { signOut } from '@/app/admin/actions';

export function AdminHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <span className="text-lg font-semibold text-emerald-700">Carefinder Admin</span>
            <nav className="flex gap-6">
              <Link
                href="/admin/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Hospitals
              </Link>
              <Link
                href="/admin/reviews"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Reviews
              </Link>
            </nav>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

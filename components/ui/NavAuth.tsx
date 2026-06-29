'use client';

import Link from 'next/link';
import { signOutAction } from '@/app/actions';

interface NavAuthProps {
  isLoggedIn: boolean;
}

export function NavAuth({ isLoggedIn }: NavAuthProps) {
  if (isLoggedIn) {
    return (
      <form action={signOutAction}>
        <button
          type="submit"
          className="hidden sm:block text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          Sign Out
        </button>
      </form>
    );
  }

  return (
    <Link
      href="/login"
      className="hidden sm:block text-gray-600 hover:text-gray-900 transition-colors"
    >
      Sign In
    </Link>
  );
}

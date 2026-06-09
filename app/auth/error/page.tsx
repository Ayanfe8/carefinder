import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function ErrorPage() {
  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-500/10 p-4">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Verification failed</h1>
        <p className="text-gray-400 mb-8 max-w-sm">
          The confirmation link is invalid or has expired. Please try signing up again.
        </p>
        <Link
          href="/register"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors mb-4"
        >
          Sign up again
        </Link>
        <div>
          <Link href="/" className="text-gray-400 hover:text-gray-300 text-sm transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

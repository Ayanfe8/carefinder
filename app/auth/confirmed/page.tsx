import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function ConfirmedPage() {
  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-500/10 p-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Account confirmed!</h1>
        <p className="text-gray-400 mb-8 max-w-sm">
          Your email has been verified. You can now log in to your account.
        </p>
        <Link
          href="/login"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors mb-4"
        >
          Continue to login
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

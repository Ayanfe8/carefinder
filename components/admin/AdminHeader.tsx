import Link from 'next/link';
import { signOut } from '@/app/admin/actions';
import { BarChart3, MessageSquare, LogOut } from 'lucide-react';

export function AdminHeader() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/admin/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CF</span>
          </div>
          <span className="font-bold text-white">Carefinder</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors font-medium"
        >
          <BarChart3 className="w-5 h-5" />
          Hospitals
        </Link>
        <Link
          href="/admin/reviews"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors font-medium"
        >
          <MessageSquare className="w-5 h-5" />
          Reviews
        </Link>
      </nav>

      {/* Sign Out */}
      <div className="border-t border-slate-800 p-4">
        <form action={signOut} className="w-full">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-900/20 hover:text-red-400 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { NavAuth } from '@/components/ui/NavAuth';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: {
    default: 'Carefinder',
    template: '%s | Carefinder',
  },
  description:
    "Nigeria's civic hospital directory — find, filter, and share hospital information.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} font-sans antialiased bg-white text-gray-900`}
      >
        <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="font-semibold text-lg text-emerald-700 tracking-tight"
            >
              Carefinder
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link
                href="/search"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Find Hospitals
              </Link>
              <NavAuth isLoggedIn={isLoggedIn} />
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-gray-200 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-10 text-center">
            <p className="text-sm text-gray-600">
              Carefinder is a free, open directory of verified healthcare
              facilities in Nigeria. Data is regularly updated and
              community-verified.
            </p>
            <p className="mt-4 text-xs text-gray-500">
              © {new Date().getFullYear()} Carefinder · Nigeria&apos;s Civic
              Hospital Directory
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

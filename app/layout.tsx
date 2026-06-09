import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Link from 'next/link';
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
  description: "Nigeria's civic hospital directory — find, filter, and share hospital information.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased bg-white text-gray-900`}>
        <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CF</span>
              </div>
              <span className="font-bold text-lg text-gray-900">Carefinder</span>
            </Link>
            <nav className="flex items-center gap-8">
              <Link
                href="/search"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Find Hospitals
              </Link>
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2"
                >
                  Log in
                </Link>
                <Link
                  href="/search"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                >
                  Find Hospitals
                </Link>
              </div>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-gray-200 mt-20 py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">CF</span>
              </div>
              <span className="font-bold text-gray-900">Carefinder</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Nigeria&apos;s Civic Hospital Directory</p>
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Carefinder. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

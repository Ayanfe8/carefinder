import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500'],
  display: 'swap',
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
    <html lang="en" className={`${plusJakarta.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-[#FAFAF9] text-slate-900">
        <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CF</span>
              </div>
              <span className="font-bold text-lg text-slate-900">Carefinder</span>
            </Link>
            <nav className="flex items-center gap-8">
              <Link
                href="/search"
                className="text-slate-700 hover:text-blue-700 transition-colors font-medium"
              >
                Find Hospitals
              </Link>
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="bg-transparent text-slate-700 hover:bg-slate-100 transition-colors font-medium px-4 py-2 rounded-lg"
                >
                  Log in
                </Link>
                <Link
                  href="/search"
                  className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-150"
                >
                  Find Hospitals
                </Link>
              </div>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-slate-200 mt-20 py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">CF</span>
              </div>
              <span className="font-bold text-slate-900">Carefinder</span>
            </div>
            <p className="text-sm text-slate-600 mb-4">Nigeria&apos;s Civic Hospital Directory</p>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Carefinder. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

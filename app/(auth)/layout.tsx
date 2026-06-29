import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Carefinder',
    template: '%s | Carefinder',
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

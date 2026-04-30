import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: {
    default: 'NOVA - Nigerian Open Verified Access',
    template: '%s | NOVA',
  },
  description: 'An open-source, API-first healthcare data platform for Nigeria. Explore health facilities, clinic schedules, and coverage across all 36 states.',
  keywords: ['Nigeria', 'healthcare', 'health facilities', 'API', 'open data', 'clinic schedules'],
  openGraph: {
    title: 'NOVA - Nigerian Open Verified Access',
    description: 'Open-source healthcare data platform for Nigeria',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

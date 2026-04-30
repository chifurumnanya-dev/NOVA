import type { Metadata } from 'next';
import Link from 'next/link';
import { Activity, ExternalLink, Github } from 'lucide-react';
import DocsSidebar from './DocsSidebar';

export const metadata: Metadata = {
  title: 'API Documentation',
  description: 'NOVA public REST API documentation for healthcare data in Nigeria',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-white text-slate-900">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/85 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
              <Activity size={14} className="text-white" />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-slate-900">NOVA</span>
            <span className="hidden sm:inline text-xs text-slate-400 font-medium border-l border-slate-200 pl-2.5 ml-1">API Docs</span>
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide text-[12px] sm:text-[13px]">
            <a
              href="/api/v1/health"
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap px-2.5 sm:px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink size={13} /> Live API
            </a>
            <a
              href="https://github.com/chifurumnanya-dev/NOVA"
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap px-2.5 sm:px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Github size={13} /> GitHub
            </a>
            <Link
              href="/"
              className="ml-1 sm:ml-2 whitespace-nowrap px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              ← Home
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:flex lg:gap-10">
        <DocsSidebar />
        <main className="flex-1 min-w-0 py-6 sm:py-10 max-w-3xl">{children}</main>
      </div>
    </div>
  );
}

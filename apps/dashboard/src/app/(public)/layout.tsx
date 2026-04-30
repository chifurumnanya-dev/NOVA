import Link from 'next/link';
import { Activity, Github, Search } from 'lucide-react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full overflow-x-hidden bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 min-w-0 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0">
              <Activity size={14} className="text-white" />
            </div>
            <span className="font-bold text-[14px] sm:text-[15px] tracking-tight text-slate-900">NOVA</span>
          </Link>
          <nav className="min-w-0 flex items-center justify-end gap-1 overflow-x-auto scrollbar-hide text-[11px] sm:text-[13px]">
            <Link
              href="/search"
              aria-label="Search"
              className="inline-flex h-8 w-8 sm:h-auto sm:w-auto items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors sm:px-3 sm:py-2"
            >
              <Search size={14} />
              <span className="hidden sm:inline sm:ml-1.5">Search</span>
            </Link>
            <Link href="/contribute" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-2.5 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors sm:px-3">
              Contribute
            </Link>
            <Link href="/docs" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-2.5 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors sm:px-3">
              Docs
            </Link>
            <a
              href="https://github.com/chifurumnanya-dev/NOVA"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="inline-flex h-8 w-8 sm:h-auto sm:w-auto items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors sm:gap-1.5 sm:px-3 sm:py-2"
            >
              <Github size={13} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-slate-200 mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left text-xs text-slate-500">
          <span>NOVA · Nigerian Open Verified Access</span>
          <span>Open Source · MIT License</span>
        </div>
      </footer>
    </div>
  );
}

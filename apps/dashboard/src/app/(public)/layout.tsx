import Link from 'next/link';
import { Activity, Github } from 'lucide-react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full overflow-x-hidden bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2.5 self-start">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
              <Activity size={14} className="text-white" />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-slate-900">NOVA</span>
          </Link>
          <nav className="grid w-full grid-cols-2 gap-2 text-xs sm:flex sm:w-auto sm:items-center sm:gap-1 sm:text-[13px]">
            <Link href="/search" className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              Search
            </Link>
            <Link href="/contribute" className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              Contribute
            </Link>
            <Link href="/docs" className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              Docs
            </Link>
            <a
              href="https://github.com/chifurumnanya-dev/NOVA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Github size={13} />
              GitHub
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

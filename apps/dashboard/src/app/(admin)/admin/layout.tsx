import Sidebar from '@/components/Sidebar';
import LogoutButton from '@/components/LogoutButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0 overflow-auto">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between lg:pl-6 pl-16">
          <div>
            <p className="text-xs text-slate-500 font-medium">Admin</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="btn-outline text-xs py-1.5">
              ← Back to public site
            </a>
            <a href="/docs" className="btn-primary text-xs py-1.5">
              API Docs
            </a>
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
        <footer className="border-t border-slate-200 px-6 py-4 text-xs text-slate-400 text-center">
          NOVA · Nigerian Open Verified Access · Open Source · MIT License
        </footer>
      </div>
    </div>
  );
}

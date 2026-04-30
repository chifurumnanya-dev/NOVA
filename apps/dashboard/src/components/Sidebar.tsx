'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Map,
  PlusCircle,
  FileCode2,
  ShieldCheck,
  Menu,
  X,
  Activity,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/map', label: 'Map Explorer', icon: Map },
  { href: '/admin/facilities', label: 'Facilities', icon: Building2 },
  { href: '/admin/clinic-schedules', label: 'Clinic Schedules', icon: CalendarDays },
  { href: '/admin/contribute', label: 'Contribute', icon: PlusCircle },
  { href: '/docs', label: 'API Docs', icon: FileCode2 },
  { href: '/admin/review', label: 'Review Queue', icon: ShieldCheck },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 btn-outline p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-sm">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-lg leading-none">NOVA</span>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-none">Nigerian Open Verified Access</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">Navigation</p>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={isActive ? 'nav-link-active' : 'nav-link'}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-green-50">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-subtle" />
            <p className="text-xs text-green-700 font-medium">API Online</p>
          </div>
        </div>
      </aside>
    </>
  );
}

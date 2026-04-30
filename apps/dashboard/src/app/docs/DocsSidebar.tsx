'use client';

import { useEffect, useState } from 'react';

type NavItem = {
  id: string;
  label: string;
  method?: 'GET' | 'POST';
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Getting Started',
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'base-url', label: 'Base URL' },
      { id: 'authentication', label: 'Authentication' },
      { id: 'rate-limits', label: 'Rate Limits' },
      { id: 'quick-start', label: 'Quick Start' },
      { id: 'response-format', label: 'Response Format' },
      { id: 'errors', label: 'Errors' },
    ],
  },
  {
    title: 'Facilities',
    items: [
      { id: 'facilities-list', label: 'List facilities', method: 'GET' },
      { id: 'facilities-get', label: 'Get a facility', method: 'GET' },
      { id: 'facilities-search', label: 'Search facilities', method: 'GET' },
      { id: 'facilities-stats', label: 'Facility statistics', method: 'GET' },
      { id: 'facilities-contribute', label: 'Submit a facility', method: 'POST' },
    ],
  },
  {
    title: 'Clinic Schedules',
    items: [
      { id: 'schedules-list', label: 'List schedules', method: 'GET' },
      { id: 'schedules-get', label: 'Get a schedule', method: 'GET' },
      { id: 'schedules-search', label: 'Search schedules', method: 'GET' },
      { id: 'schedules-contribute', label: 'Submit a schedule', method: 'POST' },
    ],
  },
  {
    title: 'Metadata',
    items: [
      { id: 'meta-states', label: 'List states', method: 'GET' },
      { id: 'meta-lgas', label: 'List LGAs by state', method: 'GET' },
      { id: 'meta-services', label: 'List services', method: 'GET' },
      { id: 'meta-specialties', label: 'List specialties', method: 'GET' },
      { id: 'meta-stats', label: 'Global statistics', method: 'GET' },
      { id: 'meta-health', label: 'Health check', method: 'GET' },
    ],
  },
];

const METHOD_STYLES: Record<string, string> = {
  GET: 'text-green-700 bg-green-50',
  POST: 'text-blue-700 bg-blue-50',
};

export default function DocsSidebar() {
  const [activeId, setActiveId] = useState<string>('overview');

  useEffect(() => {
    const ids = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.id));
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <aside className="lg:w-60 lg:shrink-0 lg:sticky lg:top-14 lg:self-start lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
      <div className="lg:hidden py-5 border-b border-slate-200">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
          On This Page
        </p>
        <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 w-max pb-1">
            {NAV_GROUPS.flatMap((group) => group.items).map((item) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    isActive
                      ? 'border-green-200 bg-green-50 text-green-800 font-medium'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {item.method && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${METHOD_STYLES[item.method]}`}>
                      {item.method}
                    </span>
                  )}
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="hidden lg:block py-10 pr-4">
        <nav className="space-y-7 text-sm">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeId === item.id;
                  return (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-green-50 text-green-800 font-medium'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {item.method && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${METHOD_STYLES[item.method]}`}
                          >
                            {item.method}
                          </span>
                        )}
                        <span className="text-[13px] leading-tight">{item.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}

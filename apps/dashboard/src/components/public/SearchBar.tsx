'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Building2,
  Hospital,
  Stethoscope,
  Landmark,
  Briefcase,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Cross,
  Baby,
} from 'lucide-react';
import { facilitiesApi, type Facility } from '@/lib/api';

type FacilityLevel = 'tertiary' | 'secondary' | 'primary';

interface SearchFilters {
  level?: FacilityLevel;
  facilityType?: string;
  ownership?: string;
  verified?: boolean;
}

interface SearchBarProps {
  size?: 'lg' | 'md';
  initialValue?: string;
  autoFocus?: boolean;
  showFilters?: boolean;
  initialFilters?: SearchFilters;
}

interface LevelTile {
  value: FacilityLevel;
  label: string;
  Icon: typeof Hospital;
}

interface SubTile {
  value: string;
  label: string;
  Icon: typeof Hospital;
}

const LEVEL_TILES: LevelTile[] = [
  { value: 'tertiary', label: 'Tertiary', Icon: Building2 },
  { value: 'secondary', label: 'Secondary', Icon: Hospital },
  { value: 'primary', label: 'Primary', Icon: Stethoscope },
];

const SUB_TILES: Record<FacilityLevel, SubTile[]> = {
  tertiary: [
    { value: 'teaching_hospital', label: 'Teaching', Icon: GraduationCap },
    { value: 'federal_medical_centre', label: 'FMC', Icon: ShieldCheck },
    { value: 'specialist_hospital', label: 'Specialist', Icon: Sparkles },
  ],
  secondary: [
    { value: 'general_hospital', label: 'General', Icon: Hospital },
    { value: 'mission_hospital', label: 'Mission', Icon: Cross },
    { value: 'private_hospital', label: 'Private hospital', Icon: Briefcase },
  ],
  primary: [
    { value: 'primary_health_centre', label: 'PHC', Icon: Stethoscope },
    { value: 'maternity_centre', label: 'Maternity', Icon: Baby },
  ],
};

const OWNERSHIP_TILES: SubTile[] = [
  { value: 'public', label: 'Public', Icon: Landmark },
  { value: 'private', label: 'Private', Icon: Briefcase },
];

export default function SearchBar({
  size = 'lg',
  initialValue = '',
  autoFocus = false,
  showFilters,
  initialFilters,
}: SearchBarProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialValue);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters ?? {});
  const [results, setResults] = useState<Facility[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  // Track whether the user has typed in this session — if not, we won't auto-open
  // the autocomplete dropdown over an already-rendered /search page.
  const userInteractedRef = useRef(false);

  const filtersEnabled = showFilters ?? size === 'lg';
  const hasAnyFilter =
    !!(filters.level || filters.facilityType || filters.ownership || filters.verified);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    // Don't fetch suggestions until the user actually interacts — prevents the
    // dropdown from popping over the /search page when it hydrates with ?q=...
    if (!userInteractedRef.current) return;
    const ac = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await facilitiesApi.list({
          q: q.trim(),
          limit: 8,
          // facility_type is more specific than level; prefer it when set
          facility_type: filters.facilityType,
          level: filters.facilityType ? undefined : filters.level,
          ownership: filters.ownership,
          verified: filters.verified ? 'true' : undefined,
        });
        setResults(res.data);
        setOpen(true);
        setHighlightIdx(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [q, filters.level, filters.facilityType, filters.ownership, filters.verified]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  function buildSearchUrl(query: string) {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (filters.level) params.set('level', filters.level);
    if (filters.facilityType) params.set('type', filters.facilityType);
    if (filters.ownership) params.set('ownership', filters.ownership);
    if (filters.verified) params.set('verified', 'true');
    return `/search?${params.toString()}`;
  }

  function submit(query: string) {
    if (!query.trim() && !hasAnyFilter) return;
    router.push(buildSearchUrl(query));
    setOpen(false);
  }

  function toggleLevel(value: FacilityLevel) {
    userInteractedRef.current = true;
    setFilters((prev) =>
      prev.level === value
        ? { ...prev, level: undefined, facilityType: undefined }
        : { ...prev, level: value, facilityType: undefined },
    );
  }

  function toggleSubType(value: string) {
    userInteractedRef.current = true;
    setFilters((prev) => ({
      ...prev,
      facilityType: prev.facilityType === value ? undefined : value,
    }));
  }

  function toggleOwnership(value: string) {
    userInteractedRef.current = true;
    setFilters((prev) => ({
      ...prev,
      ownership: prev.ownership === value ? undefined : value,
    }));
  }

  function toggleVerified() {
    userInteractedRef.current = true;
    setFilters((prev) => ({ ...prev, verified: !prev.verified }));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIdx >= 0 && results[highlightIdx]) {
        router.push(`/facilities/${results[highlightIdx].id}`);
        setOpen(false);
      } else {
        submit(q);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const isLg = size === 'lg';
  const subTiles = filters.level ? SUB_TILES[filters.level] : [];

  return (
    <div ref={containerRef} className="relative w-full">
      <div className={isLg ? 'relative flex flex-col gap-3 sm:block' : 'relative'}>
        <div className="relative">
          <Search
            size={isLg ? 18 : 15}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={q}
            onChange={(e) => {
              userInteractedRef.current = true;
              setQ(e.target.value);
            }}
            onFocus={() => results.length > 0 && setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search a hospital, clinic, or specialty…"
            autoFocus={autoFocus}
            className={`
              w-full bg-white border border-slate-300 rounded-2xl shadow-sm
              text-slate-900 placeholder:text-slate-400
              focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500
              transition-all
              ${isLg ? 'pl-12 pr-4 py-4 text-[15px] sm:pr-32' : 'pl-10 pr-24 py-2.5 text-sm'}
            `}
          />
        </div>
        <button
          type="button"
          onClick={() => submit(q)}
          disabled={!q.trim() && !hasAnyFilter}
          className={`
            inline-flex items-center justify-center
            bg-green-600 hover:bg-green-700 disabled:bg-green-600/40 disabled:cursor-not-allowed
            text-white font-semibold rounded-xl transition-colors
            ${isLg ? 'w-full px-5 py-3 text-sm sm:absolute sm:right-2 sm:top-1/2 sm:w-auto sm:-translate-y-1/2 sm:py-2.5' : 'absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 text-xs'}
          `}
        >
          Search
        </button>
      </div>

      {filtersEnabled && (
        <div className="mt-3 flex flex-col items-center gap-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {LEVEL_TILES.map((tile) => {
              const active = filters.level === tile.value;
              const Icon = tile.Icon;
              return (
                <Chip key={tile.value} active={active} onClick={() => toggleLevel(tile.value)}>
                  <Icon size={12} />
                  {tile.label}
                </Chip>
              );
            })}
            {OWNERSHIP_TILES.map((tile) => {
              const active = filters.ownership === tile.value;
              const Icon = tile.Icon;
              return (
                <Chip key={tile.value} active={active} onClick={() => toggleOwnership(tile.value)}>
                  <Icon size={12} />
                  {tile.label}
                </Chip>
              );
            })}
            <Chip active={!!filters.verified} onClick={toggleVerified}>
              <ShieldCheck size={12} />
              Verified
            </Chip>
            {hasAnyFilter && (
              <button
                type="button"
                onClick={() => setFilters({})}
                className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2 ml-1"
              >
                Clear
              </button>
            )}
          </div>

          {subTiles.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-semibold mr-1">
                {filters.level} types
              </span>
              {subTiles.map((tile) => {
                const active = filters.facilityType === tile.value;
                const Icon = tile.Icon;
                return (
                  <Chip
                    key={tile.value}
                    active={active}
                    variant="sub"
                    onClick={() => toggleSubType(tile.value)}
                  >
                    <Icon size={11} />
                    {tile.label}
                  </Chip>
                );
              })}
            </div>
          )}
        </div>
      )}

      {open && (results.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          {loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-500">Searching…</div>
          )}
          {results.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onMouseEnter={() => setHighlightIdx(i)}
              onClick={() => {
                router.push(`/facilities/${f.id}`);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-slate-100 last:border-0 transition-colors ${
                highlightIdx === i ? 'bg-green-50' : 'hover:bg-slate-50'
              }`}
            >
              <MapPin size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-900 font-medium truncate">{f.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {labelFor(f.facilityType)} · {f.state?.name ?? '—'}
                  {f.lga?.name ? ` · ${f.lga.name}` : ''}
                </div>
              </div>
            </button>
          ))}
          {results.length > 0 && (
            <button
              type="button"
              onClick={() => submit(q)}
              className="w-full text-left px-4 py-2.5 bg-slate-50 text-xs text-slate-500 hover:text-green-600 transition-colors"
            >
              View all results for &ldquo;{q}&rdquo; →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  variant = 'primary',
  children,
}: {
  active: boolean;
  onClick: () => void;
  variant?: 'primary' | 'sub';
  children: React.ReactNode;
}) {
  const base =
    variant === 'sub'
      ? 'px-2.5 py-1 rounded-full border text-[11px] font-medium'
      : 'px-3 py-1.5 rounded-full border text-xs font-medium';
  const palette = active
    ? variant === 'sub'
      ? 'bg-green-50 border-green-500 text-green-700'
      : 'bg-green-600 border-green-600 text-white shadow-sm'
    : 'bg-white border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-700';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 transition-all ${base} ${palette}`}
    >
      {children}
    </button>
  );
}

function labelFor(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

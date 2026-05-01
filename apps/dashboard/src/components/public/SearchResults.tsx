'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { facilitiesApi, clinicSchedulesApi, type Facility, type ClinicSchedule } from '@/lib/api';
import {
  MapPin,
  Phone,
  Globe,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  Hospital,
  Stethoscope,
} from 'lucide-react';

const FacilitiesLeafletMap = dynamic(() => import('./FacilitiesLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-white rounded-2xl flex items-center justify-center text-slate-500 text-sm">
      Loading map…
    </div>
  ),
});

interface Props {
  q: string;
  state?: string;
  type?: string;
  level?: 'tertiary' | 'secondary' | 'primary';
  ownership?: string;
  verified?: boolean;
}

export default function SearchResults({ q, state, type, level, ownership, verified }: Props) {
  const router = useRouter();
  const [results, setResults] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<ClinicSchedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const hasAnyFilter = !!(q || state || type || level || ownership || verified);
  const pageSize = isMobile ? 12 : 200;

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!hasAnyFilter) {
      setResults([]);
      setPage(1);
      setHasNextPage(false);
      setSelectedId(null);
      return;
    }

    setLoading(true);
    setError(null);
    setPage(1);
    facilitiesApi
      .list({
        q: q || undefined,
        state,
        facility_type: type,
        level,
        ownership,
        verified: verified ? 'true' : undefined,
        page: 1,
        limit: pageSize,
      })
      .then((res) => {
        setResults(res.data);
        setHasNextPage(Boolean(res.meta?.has_next_page));
      })
      .catch((e) => setError(e.message ?? 'Search failed'))
      .finally(() => setLoading(false));
  }, [q, state, type, level, ownership, verified, hasAnyFilter, pageSize]);

  useEffect(() => {
    if (!isMobile || !hasAnyFilter || page === 1 || !hasNextPage) return;

    setLoadingMore(true);
    facilitiesApi
      .list({
        q: q || undefined,
        state,
        facility_type: type,
        level,
        ownership,
        verified: verified ? 'true' : undefined,
        page,
        limit: pageSize,
      })
      .then((res) => {
        setResults((prev) => {
          const seen = new Set(prev.map((item) => item.id));
          const next = res.data.filter((item) => !seen.has(item.id));
          return [...prev, ...next];
        });
        setHasNextPage(Boolean(res.meta?.has_next_page));
      })
      .catch((e) => setError(e.message ?? 'Search failed'))
      .finally(() => setLoadingMore(false));
  }, [page, q, state, type, level, ownership, verified, hasAnyFilter, hasNextPage, isMobile, pageSize]);

  useEffect(() => {
    if (results.length === 0) {
      setSelectedId(null);
      return;
    }
    if (isMobile) {
      setSelectedId(null);
      return;
    }
    setSelectedId((current) => (
      current && results.some((result) => result.id === current) ? current : results[0].id
    ));
  }, [results, isMobile]);

  useEffect(() => {
    if (!isMobile || !hasAnyFilter || !hasNextPage || loading || loadingMore) return;
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPage((current) => current + 1);
        }
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasAnyFilter, hasNextPage, isMobile, loading, loadingMore, results.length]);

  useEffect(() => {
    if (!selectedId) {
      setSchedules([]);
      return;
    }
    setSchedulesLoading(true);
    clinicSchedulesApi
      .list({ facility_id: selectedId, limit: 50 })
      .then((res) => setSchedules(res.data))
      .catch(() => setSchedules([]))
      .finally(() => setSchedulesLoading(false));
  }, [selectedId]);

  const selected = useMemo(
    () => results.find((r) => r.id === selectedId) ?? null,
    [results, selectedId],
  );

  function handleFacilitySelect(id: string) {
    if (isMobile) {
      router.push(`/facilities/${id}`);
      return;
    }
    setSelectedId(id);
  }

  if (!hasAnyFilter) {
    return (
      <div className="text-center text-slate-500 text-sm py-20">
        Type a hospital, clinic, or specialty above to search.
      </div>
    );
  }

  return (
    <div>
      <div className="text-xs text-slate-500 mb-3">
        {loading ? 'Searching…' : `${results.length} facilities`}
        {q ? ` for "${q}"` : ''}
        {!loading && isMobile ? ' · scroll for more' : ''}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3 mb-3">
          {error}
        </div>
      )}

      <div
        className="
          grid gap-4 h-auto min-h-0
          grid-cols-1
          sm:h-[calc(100vh-220px)] sm:min-h-[560px]
          lg:grid-cols-[minmax(0,340px)_1fr]
          xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)_minmax(0,400px)]
        "
      >
        {/* ── Result list ─────────────────────────────────────────────── */}
        <div className="overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
          {results.length === 0 && !loading && (
            <div className="p-6 text-center text-slate-500 text-sm">
              No facilities match this search.
            </div>
          )}
          {results.map((f) => (
            <ResultRow
              key={f.id}
              facility={f}
              active={selectedId === f.id}
              onClick={() => handleFacilitySelect(f.id)}
            />
          ))}
          {isMobile && (loadingMore || hasNextPage) && (
            <div ref={loadMoreRef} className="px-4 py-4 text-center text-xs text-slate-500">
              {loadingMore ? 'Loading more facilities…' : 'Scroll to load more'}
            </div>
          )}
        </div>

        {/* ── Map ─────────────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm min-h-[300px] xl:min-h-0">
          <FacilitiesLeafletMap
            facilities={results}
            selectedId={selectedId}
            onSelect={handleFacilitySelect}
          />
        </div>

        {/* ── Detail panel (xl: side column · below xl: slide-over) ──── */}
        <div className="hidden xl:block overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          {selected ? (
            <DetailPanel
              facility={selected}
              schedules={schedules}
              schedulesLoading={schedulesLoading}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-center px-6 text-sm text-slate-500">
              Select a facility on the left to see details.
            </div>
          )}
        </div>

        {/* ── Mobile/tablet detail (slides up below the map) ─────────── */}
        {!isMobile && selected && (
          <div className="xl:hidden lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <DetailPanel
              facility={selected}
              schedules={schedules}
              schedulesLoading={schedulesLoading}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ResultRow({
  facility,
  active,
  onClick,
}: {
  facility: Facility;
  active: boolean;
  onClick: () => void;
}) {
  const verified = facility.verificationStatus.includes('verified');
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left px-4 py-3.5 transition-colors border-l-2
        ${active
          ? 'bg-green-50 border-green-500'
          : 'hover:bg-slate-50 border-transparent'}
      `}
    >
      <div className="flex items-start gap-2.5">
        <LevelIcon type={facility.facilityType} active={active} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium text-slate-900 flex-1 leading-snug break-words">
              {facility.name}
            </span>
            {verified ? (
              <CheckCircle2 size={13} className="text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle size={13} className="text-amber-600 mt-0.5 flex-shrink-0" />
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5 leading-snug">
            {labelType(facility.facilityType)}
            {facility.state?.name ? ` · ${facility.state.name}` : ''}
            {facility.lga?.name ? ` · ${facility.lga.name}` : ''}
          </div>
        </div>
      </div>
    </button>
  );
}

function LevelIcon({ type, active }: { type: string; active: boolean }) {
  const tone = active ? 'text-green-600' : 'text-slate-400';
  const Icon = type.includes('teaching') || type.includes('federal') || type.includes('specialist')
    ? Building2
    : type.includes('hospital')
    ? Hospital
    : Stethoscope;
  return <Icon size={14} className={`${tone} mt-0.5 flex-shrink-0`} />;
}

function DetailPanel({
  facility,
  schedules,
  schedulesLoading,
  onClose,
}: {
  facility: Facility;
  schedules: ClinicSchedule[];
  schedulesLoading: boolean;
  onClose?: () => void;
}) {
  const verified = facility.verificationStatus.includes('verified');
  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900 leading-tight break-words">
            {facility.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1.5">
            {labelType(facility.facilityType)} · {facility.ownership}
            {facility.state?.name ? ` · ${facility.state.name}` : ''}
            {facility.lga?.name ? ` · ${facility.lga.name}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${
              verified
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {facility.verificationStatus.replace(/_/g, ' ')}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        {facility.address && <DetailRow icon={<MapPin size={13} />} text={facility.address} />}
        {facility.phone && (
          <DetailRow icon={<Phone size={13} />} text={facility.phone} href={`tel:${facility.phone}`} />
        )}
        {facility.website && (
          <DetailRow icon={<Globe size={13} />} text={facility.website} href={facility.website} />
        )}
      </div>

      <div className="mt-5">
        <h3 className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold mb-2">
          Clinic schedules
        </h3>
        {schedulesLoading ? (
          <div className="text-xs text-slate-500">Loading…</div>
        ) : schedules.length === 0 ? (
          <div className="text-xs text-slate-500">No published schedules yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {schedules.slice(0, 12).map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
              >
                <div className="text-slate-900 font-medium truncate">{s.clinicName}</div>
                <div className="text-slate-500 mt-0.5 capitalize">
                  {s.dayOfWeek} · {s.startTime}–{s.endTime}
                </div>
                {s.referralRequired && (
                  <div className="text-amber-700 text-[10px] mt-0.5">Referral required</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  text,
  href,
}: {
  icon: React.ReactNode;
  text: string;
  href?: string;
}) {
  const inner = (
    <span className="flex items-start gap-2 text-slate-700">
      <span className="text-slate-400 mt-0.5">{icon}</span>
      <span className="break-all">{text}</span>
    </span>
  );
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block hover:text-green-700 transition-colors"
    >
      {inner}
    </a>
  ) : (
    inner
  );
}

function labelType(t: string): string {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

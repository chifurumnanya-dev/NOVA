'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
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
    <div className="h-full bg-white/[0.02] rounded-2xl flex items-center justify-center text-slate-500 text-sm">
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
  const [results, setResults] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<ClinicSchedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  const hasAnyFilter = !!(q || state || type || level || ownership || verified);

  useEffect(() => {
    if (!hasAnyFilter) return;
    setLoading(true);
    setError(null);
    facilitiesApi
      .list({
        q: q || undefined,
        state,
        facility_type: type,
        level,
        ownership,
        verified: verified ? 'true' : undefined,
        limit: 200,
      })
      .then((res) => {
        setResults(res.data);
        setSelectedId(res.data.length > 0 ? res.data[0].id : null);
      })
      .catch((e) => setError(e.message ?? 'Search failed'))
      .finally(() => setLoading(false));
  }, [q, state, type, level, ownership, verified, hasAnyFilter]);

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
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/[0.05] text-red-300 text-sm px-4 py-3 mb-3">
          {error}
        </div>
      )}

      <div
        className="
          grid gap-4 h-[calc(100vh-220px)] min-h-[560px]
          grid-cols-1
          lg:grid-cols-[minmax(0,340px)_1fr]
          xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)_minmax(0,400px)]
        "
      >
        {/* ── Result list ─────────────────────────────────────────────── */}
        <div className="overflow-y-auto rounded-2xl border border-white/5 bg-white/[0.02] divide-y divide-white/5">
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
              onClick={() => setSelectedId(f.id)}
            />
          ))}
        </div>

        {/* ── Map ─────────────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] min-h-[300px] xl:min-h-0">
          <FacilitiesLeafletMap
            facilities={results}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* ── Detail panel (xl: side column · below xl: slide-over) ──── */}
        <div className="hidden xl:block overflow-y-auto rounded-2xl border border-white/5 bg-white/[0.02]">
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
        {selected && (
          <div className="xl:hidden lg:col-span-2 rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
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
          ? 'bg-emerald-400/[0.08] border-emerald-400'
          : 'hover:bg-white/[0.03] border-transparent'}
      `}
    >
      <div className="flex items-start gap-2.5">
        <LevelIcon type={facility.facilityType} active={active} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium text-slate-100 flex-1 leading-snug break-words">
              {facility.name}
            </span>
            {verified ? (
              <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle size={13} className="text-amber-400/70 mt-0.5 flex-shrink-0" />
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
  const tone = active ? 'text-emerald-300' : 'text-slate-500';
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
          <h2 className="text-lg font-semibold text-white leading-tight break-words">
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
                ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20'
                : 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
            }`}
          >
            {facility.verificationStatus.replace(/_/g, ' ')}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="text-slate-500 hover:text-slate-300 transition-colors"
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
                className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs"
              >
                <div className="text-slate-200 font-medium truncate">{s.clinicName}</div>
                <div className="text-slate-500 mt-0.5 capitalize">
                  {s.dayOfWeek} · {s.startTime}–{s.endTime}
                </div>
                {s.referralRequired && (
                  <div className="text-amber-300/80 text-[10px] mt-0.5">Referral required</div>
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
    <span className="flex items-start gap-2 text-slate-300">
      <span className="text-slate-500 mt-0.5">{icon}</span>
      <span className="break-all">{text}</span>
    </span>
  );
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block hover:text-emerald-300 transition-colors"
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

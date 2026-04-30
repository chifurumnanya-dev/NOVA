'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pencil,
  ExternalLink,
  Building2,
  Calendar,
} from 'lucide-react';
import { useQuery } from '@/hooks/useQuery';
import { facilitiesApi, clinicSchedulesApi, type Facility, type ClinicSchedule } from '@/lib/api';
import SuggestEditModal from '@/components/public/SuggestEditModal';

const FacilityMap = dynamic(() => import('@/components/FacilityMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">
      Loading map…
    </div>
  ),
});

const DAY_NAMES: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export default function PublicFacilityPage({ params }: { params: { id: string } }) {
  const [editOpen, setEditOpen] = useState(false);
  const { data: f, isLoading, error, refetch } = useQuery<Facility>(
    () => facilitiesApi.getById(params.id),
    [params.id],
  );

  const { data: schedules } = useQuery<ClinicSchedule[]>(
    () => clinicSchedulesApi.list({ facility_id: params.id, limit: 50 }),
    [params.id],
  );

  if (isLoading) return <FacilitySkeleton />;
  if (error)
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  if (!f) return null;

  const verified = f.verificationStatus.includes('verified');
  const hasCoords = f.latitude != null && f.longitude != null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-16">
      {/* Breadcrumb */}
      <Link
        href="/search"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={14} /> Back to search
      </Link>

      {/* Hero */}
      <section className="mt-5 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 px-6 sm:px-8 py-10 text-white">
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
              maskImage: 'radial-gradient(ellipse 60% 80% at 30% 50%, black 30%, transparent 100%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 60% 80% at 30% 50%, black 30%, transparent 100%)',
            }}
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.16em] ${
                  verified
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'bg-amber-400/20 text-amber-50 border border-amber-300/30'
                }`}
              >
                {verified ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                {f.verificationStatus.replace(/_/g, ' ')}
              </span>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold leading-tight">{f.name}</h1>
              <p className="mt-2 text-sm text-green-50/90 flex items-center gap-1.5">
                <MapPin size={13} />
                {[f.lga?.name, f.state?.name].filter(Boolean).join(', ') || '—'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Pill icon={<Building2 size={11} />}>{labelType(f.facilityType)}</Pill>
                <Pill>{capitalize(f.ownership)}</Pill>
                {hasCoords && (
                  <Pill>
                    {f.latitude!.toFixed(4)}, {f.longitude!.toFixed(4)}
                  </Pill>
                )}
              </div>
            </div>
            <button
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-green-700 text-sm font-semibold hover:bg-green-50 transition-colors shadow-sm self-start"
            >
              <Pencil size={14} /> Suggest an edit
            </button>
          </div>
        </div>

        {/* Quick contact strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <ContactCell icon={<Phone size={14} />} label="Phone" value={f.phone} href={f.phone ? `tel:${f.phone}` : undefined} />
          <ContactCell icon={<Mail size={14} />} label="Email" value={f.email} href={f.email ? `mailto:${f.email}` : undefined} />
          <ContactCell icon={<Globe size={14} />} label="Website" value={f.website ? 'Visit' : null} href={f.website ?? undefined} external />
          <ContactCell icon={<Clock size={14} />} label="Hours" value={f.openingHours} />
        </div>
      </section>

      {/* Body grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Address */}
          {f.address && (
            <Card title="Address">
              <p className="text-sm text-slate-700 leading-relaxed">{f.address}</p>
              {f.ward && <p className="text-xs text-slate-500 mt-2">Ward · {f.ward}</p>}
            </Card>
          )}

          {/* Services */}
          <Card title="Services offered">
            {f.facilityServices?.length ? (
              <div className="flex flex-wrap gap-2">
                {f.facilityServices.map((fs) => (
                  <span
                    key={fs.service.id}
                    className="px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-medium"
                  >
                    {fs.service.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No services listed yet.</p>
            )}
          </Card>

          {/* Map */}
          {hasCoords && (
            <Card title="Location">
              <div className="h-72 rounded-xl overflow-hidden">
                <FacilityMap lat={f.latitude!} lon={f.longitude!} name={f.name} />
              </div>
            </Card>
          )}

          {/* Clinic schedules */}
          <Card title="Clinic schedules" icon={<Calendar size={14} className="text-slate-400" />}>
            {schedules && schedules.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {schedules.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/40 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900 truncate">{s.clinicName}</p>
                      {s.referralRequired && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200">
                          Referral
                        </span>
                      )}
                    </div>
                    {s.specialty && (
                      <p className="text-xs text-green-700 mt-0.5">{s.specialty.name}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1.5">
                      {DAY_NAMES[s.dayOfWeek] ?? s.dayOfWeek} · {s.startTime}–{s.endTime}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No published schedules yet.</p>
            )}
          </Card>
        </div>

        {/* Right column */}
        <aside className="space-y-5">
          <Card title="Data quality">
            <Row label="Source" value={f.dataSource ?? 'Unknown'} />
            <Row
              label="Last verified"
              value={
                f.lastVerifiedAt
                  ? new Date(f.lastVerifiedAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })
                  : 'Never'
              }
            />
            <div className="flex items-center justify-between gap-3 py-2">
              <span className="text-xs text-slate-500">Confidence</span>
              <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${(f.confidenceScore ?? 0) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-green-700 w-8 text-right">
                  {Math.round((f.confidenceScore ?? 0) * 100)}%
                </span>
              </div>
            </div>
          </Card>

          <Card title="Help improve this record">
            <p className="text-xs text-slate-600 leading-relaxed">
              Spot something out of date? Suggest an edit and our reviewers will verify your update.
            </p>
            <button
              onClick={() => setEditOpen(true)}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              <Pencil size={13} /> Suggest an edit
            </button>
          </Card>
        </aside>
      </div>

      {editOpen && (
        <SuggestEditModal facility={f} onClose={() => setEditOpen(false)} />
      )}
    </div>
  );
}

function FacilitySkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-4 w-32 bg-slate-200 rounded" />
      <div className="mt-5 rounded-3xl border border-slate-200 bg-white overflow-hidden">
        <div className="h-44 bg-slate-200" />
        <div className="grid grid-cols-4 divide-x divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="h-3 w-16 bg-slate-200 rounded" />
              <div className="h-4 w-24 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-5">
        <div className="col-span-2 h-72 bg-white border border-slate-200 rounded-2xl" />
        <div className="h-72 bg-white border border-slate-200 rounded-2xl" />
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="px-5 pt-5 pb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold">
          {title}
        </h2>
      </div>
      <div className="px-5 pb-5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800 font-medium text-right truncate max-w-[60%]">{value}</span>
    </div>
  );
}

function ContactCell({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <div className="px-5 py-4 flex items-start gap-3">
      <span className="text-slate-400 mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-semibold">
          {label}
        </p>
        {value ? (
          <p className="text-sm text-slate-800 mt-0.5 truncate flex items-center gap-1">
            {value}
            {external && href && <ExternalLink size={10} />}
          </p>
        ) : (
          <p className="text-sm text-slate-400 mt-0.5">—</p>
        )}
      </div>
    </div>
  );
  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className="hover:bg-slate-50 transition-colors"
      >
        {content}
      </a>
    );
  }
  return content;
}

function Pill({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-medium">
      {icon}
      {children}
    </span>
  );
}

function labelType(t: string): string {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

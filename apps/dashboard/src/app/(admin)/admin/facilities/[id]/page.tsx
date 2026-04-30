'use client';

import { MapPin, Phone, Globe, Mail, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { VerificationBadge, FacilityTypeBadge, OwnershipBadge } from '@/components/Badges';
import { Skeleton } from '@/components/Skeletons';
import { ErrorState } from '@/components/States';
import { useQuery } from '@/hooks/useQuery';
import { facilitiesApi, type Facility } from '@/lib/api';
import FacilityMap from '@/components/FacilityMap';
import Link from 'next/link';
import { Edit2 } from 'lucide-react';

const DAY_NAMES: Record<string, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};

function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex items-center gap-2">
        <Skeleton className="w-20 h-4 rounded" />
        <span className="text-slate-300">/</span>
        <Skeleton className="w-48 h-4 rounded" />
      </div>
      <div className="card overflow-hidden">
        <div className="bg-slate-200 px-6 py-8 h-36 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4">
              <Skeleton className="w-12 h-3 mb-2 rounded" />
              <Skeleton className="w-28 h-4 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card xl:col-span-2 p-6">
          <Skeleton className="w-32 h-5 mb-4 rounded" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="w-24 h-6 rounded-full" />)}
          </div>
        </div>
        <div className="card p-6 space-y-3">
          <Skeleton className="w-24 h-5 mb-2 rounded" />
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="w-full h-4 rounded" />)}
        </div>
      </div>
    </div>
  );
}

export default function FacilityProfilePage({ params }: { params: { id: string } }) {
  const { data: f, isLoading, error, refetch } = useQuery<Facility>(
    () => facilitiesApi.getById(params.id),
    [params.id],
  );

  if (isLoading) return <ProfileSkeleton />;
  if (error) return (
    <div className="max-w-5xl">
      <ErrorState message={error} onRetry={refetch} />
    </div>
  );
  if (!f) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <a href="/admin/facilities" className="hover:text-slate-900 transition-colors">Facilities</a>
        <span>/</span>
        <span className="text-slate-900 font-medium truncate max-w-xs">{f.name}</span>
      </div>

      {/* Hero card */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-teal-700 to-green-800 px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">{f.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <MapPin size={14} className="text-teal-200" />
                <p className="text-teal-100 text-sm">
                  {[f.lga?.name, f.state?.name].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <VerificationBadge status={f.verificationStatus as any} />
              <Link
                href={`/admin/facilities/${f.id}/edit`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
              >
                <Edit2 size={12} /> Edit
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <FacilityTypeBadge type={f.facilityType} />
            <OwnershipBadge ownership={f.ownership} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100">
          {[
            { label: 'Phone', value: f.phone ?? 'N/A', icon: Phone },
            { label: 'Email', value: f.email ?? 'N/A', icon: Mail },
            { label: 'Website', value: f.website ? 'Visit website' : 'N/A', icon: Globe, href: f.website ?? undefined },
            { label: 'Hours', value: f.openingHours ?? 'N/A', icon: Clock },
          ].map(({ label, value, icon: Icon, href }) => (
            <div key={label} className="p-4 flex items-start gap-3">
              <Icon size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline flex items-center gap-1">
                    {value} <ExternalLink size={11} />
                  </a>
                ) : (
                  <p className="text-sm text-slate-700">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Services */}
        <div className="card xl:col-span-2">
          <div className="card-header">
            <h2 className="section-title">Services Offered</h2>
          </div>
          <div className="card-body">
            {f.facilityServices?.length ? (
              <div className="flex flex-wrap gap-2">
                {f.facilityServices.map((fs) => (
                  <span key={fs.service.id} className="badge-green">{fs.service.name}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No services listed</p>
            )}

            {/* Map & Coordinates */}
            {(f.latitude != null && f.longitude != null) && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Location & Geocoordinates</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="data-row">
                      <span className="data-label">Latitude</span>
                      <span className="data-value font-mono">{f.latitude}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Longitude</span>
                      <span className="data-value font-mono">{f.longitude}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Ward</span>
                      <span className="data-value">{f.ward ?? '—'}</span>
                    </div>
                  </div>
                  <div className="h-48">
                    <FacilityMap lat={f.latitude} lon={f.longitude} name={f.name} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Data quality */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Data Quality</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="data-row">
              <span className="data-label">Source</span>
              <span className="data-value">{f.dataSource ?? 'Unknown'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Last Verified</span>
              <span className="data-value">
                {f.lastVerifiedAt
                  ? new Date(f.lastVerifiedAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })
                  : 'Not verified'}
              </span>
            </div>
            <div className="data-row">
              <span className="data-label">Confidence</span>
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${(f.confidenceScore ?? 0) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-green-700 w-8">
                   {Math.round((f.confidenceScore ?? 0) * 100)}%
                </span>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 space-y-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry Information</h3>
              <div className="data-row">
                <span className="data-label">NHFR UID</span>
                <span className="data-value font-mono text-[11px]">{f.externalId ?? '—'}</span>
              </div>
              <div className="data-row">
                <span className="data-label">NHFR Code</span>
                <span className="data-value font-mono text-[11px]">{f.externalCode ?? '—'}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Level</span>
                <span className="data-value">{f.metadata?.facility_level || '—'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <a href={`/contribute?entity=facility&id=${f.id}`} className="btn-outline w-full justify-center text-xs">
                Suggest Correction
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Clinic Schedules */}
      {f.clinicSchedules && f.clinicSchedules.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Clinic Schedules</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="table-header px-4 py-3 text-left">Clinic</th>
                  <th className="table-header px-4 py-3 text-left">Specialty</th>
                  <th className="table-header px-4 py-3 text-left">Day</th>
                  <th className="table-header px-4 py-3 text-left">Time</th>
                  <th className="table-header px-4 py-3 text-left">Referral</th>
                </tr>
              </thead>
              <tbody>
                {f.clinicSchedules.map((cs) => (
                  <tr key={cs.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="table-cell font-medium text-slate-900">{cs.clinicName}</td>
                    <td className="table-cell">
                      {cs.specialty ? <span className="badge-blue">{cs.specialty.name}</span> : <span className="text-slate-400 text-xs">—</span>}
                    </td>
                    <td className="table-cell">{DAY_NAMES[cs.dayOfWeek] ?? cs.dayOfWeek}</td>
                    <td className="table-cell font-mono text-slate-600">{cs.startTime} – {cs.endTime}</td>
                    <td className="table-cell">
                      {cs.referralRequired
                        ? <span className="badge-amber">Required</span>
                        : <span className="badge-green">Walk-in</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

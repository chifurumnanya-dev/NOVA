'use client';

import { useState, useCallback } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { VerificationBadge, FacilityTypeBadge, OwnershipBadge } from '@/components/Badges';
import { TableRowSkeleton } from '@/components/Skeletons';
import { ErrorState, EmptyState } from '@/components/States';
import { useQuery } from '@/hooks/useQuery';
import { facilitiesApi, type FacilityFilters, type Facility } from '@/lib/api';

const FACILITY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'teaching_hospital', label: 'Teaching Hospital' },
  { value: 'federal_medical_centre', label: 'Federal Medical Centre (FMC)' },
  { value: 'general_hospital', label: 'General Hospital' },
  { value: 'primary_health_centre', label: 'Primary Health Centre' },
  { value: 'private_hospital', label: 'Private Hospital' },
  { value: 'mission_hospital', label: 'Mission Hospital' },
  { value: 'specialist_hospital', label: 'Specialist Hospital' },
  { value: 'diagnostic_centre', label: 'Diagnostic Centre' },
  { value: 'laboratory', label: 'Laboratory' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'maternity_centre', label: 'Maternity Centre' },
  { value: 'dialysis_centre', label: 'Dialysis Centre' },
  { value: 'emergency_centre', label: 'Emergency Centre' },
];

const STATES = [
  '', 'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti',
  'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

export default function FacilitiesPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FacilityFilters>({ limit: 20 });
  const [search, setSearch] = useState('');

  const { data, meta, isLoading, error, refetch } = useQuery<Facility[]>(
    () => facilitiesApi.list({ ...filters, q: search || undefined, page }),
    [filters, search, page],
  );

  const update = useCallback((partial: Partial<FacilityFilters>) => {
    setFilters((f) => ({ ...f, ...partial }));
    setPage(1);
  }, []);

  const total = meta?.total ?? 0;
  const totalPages = meta?.total_pages ?? 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Health Facilities</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isLoading ? (
              <span className="skeleton inline-block w-32 h-4 rounded" />
            ) : (
              <><span className="font-semibold text-slate-800">{total.toLocaleString()}</span> facilities across Nigeria</>
            )}
          </p>
        </div>
        <a href="/admin/contribute" className="btn-primary">+ Contribute</a>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by facility name..."
              className="input pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="select w-full sm:w-44"
            value={filters.state ?? ''}
            onChange={(e) => update({ state: e.target.value || undefined })}
          >
            <option value="">All States</option>
            {STATES.slice(1).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className="select w-full sm:w-52"
            value={filters.facility_type ?? ''}
            onChange={(e) => update({ facility_type: e.target.value || undefined })}
          >
            {FACILITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select
            className="select w-full sm:w-36"
            value={filters.ownership ?? ''}
            onChange={(e) => update({ ownership: e.target.value || undefined })}
          >
            <option value="">Ownership</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="mission">Mission</option>
            <option value="ngo">NGO</option>
          </select>
          <select
            className="select w-full sm:w-36"
            value={filters.verified ?? ''}
            onChange={(e) => update({ verified: (e.target.value as any) || undefined })}
          >
            <option value="">Any Status</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">
              {isLoading ? 'Loading…' : `Showing ${((page - 1) * 20) + 1}–${Math.min(page * 20, total)} of ${total.toLocaleString()}`}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="table-header px-4 py-3 text-left">Facility</th>
                <th className="table-header px-4 py-3 text-left">Type</th>
                <th className="table-header px-4 py-3 text-left">Ownership</th>
                <th className="table-header px-4 py-3 text-left">Location</th>
                <th className="table-header px-4 py-3 text-left">Services</th>
                <th className="table-header px-4 py-3 text-left">Status</th>
                <th className="table-header px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
              ) : error ? (
                <tr>
                  <td colSpan={7}>
                    <ErrorState message={error} onRetry={refetch} />
                  </td>
                </tr>
              ) : !data?.length ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title="No facilities found"
                      description="Try adjusting your filters or search query."
                      action={
                        <button onClick={() => { setFilters({ limit: 20 }); setSearch(''); setPage(1); }} className="btn-outline">
                          Clear filters
                        </button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                data.map((f) => (
                  <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                    <td className="table-cell">
                      <div>
                        <a href={`/admin/facilities/${f.id}`} className="font-semibold text-slate-900 hover:text-green-600 transition-colors">
                          {f.name}
                        </a>
                        {f.phone && <p className="text-xs text-slate-400 mt-0.5">{f.phone}</p>}
                      </div>
                    </td>
                    <td className="table-cell"><FacilityTypeBadge type={f.facilityType} /></td>
                    <td className="table-cell"><OwnershipBadge ownership={f.ownership} /></td>
                    <td className="table-cell">
                      <div className="text-slate-700">{f.state?.name}</div>
                      <div className="text-xs text-slate-400">{f.lga?.name}</div>
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {f.facilityServices?.slice(0, 2).map((fs) => (
                          <span key={fs.service.id} className="badge-slate text-[10px]">{fs.service.name}</span>
                        ))}
                        {(f.facilityServices?.length ?? 0) > 2 && (
                          <span className="badge-slate text-[10px]">+{f.facilityServices.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <VerificationBadge status={f.verificationStatus as any} />
                    </td>
                    <td className="table-cell">
                      <a href={`/admin/facilities/${f.id}`} className="text-sm text-green-600 hover:text-green-700 font-medium">View →</a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">Page {page} of {totalPages.toLocaleString()}</p>
            <div className="flex items-center gap-2">
              <button
                className="btn-outline py-1.5 px-3 text-xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                className="btn-outline py-1.5 px-3 text-xs"
                disabled={!meta?.has_next_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

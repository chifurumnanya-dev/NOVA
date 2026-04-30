'use client';

import { useState, useCallback } from 'react';
import { Search, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { VerificationBadge } from '@/components/Badges';
import { CardSkeleton } from '@/components/Skeletons';
import { ErrorState, EmptyState } from '@/components/States';
import { useQuery } from '@/hooks/useQuery';
import { clinicSchedulesApi, type ClinicFilters, type ClinicSchedule } from '@/lib/api';

const SPECIALTIES = [
  'All Specialties', 'Cardiology', 'Paediatrics', 'Obstetrics and Gynaecology',
  'Surgery', 'Orthopaedics', 'Ophthalmology', 'ENT', 'Dermatology',
  'Psychiatry', 'Neurology', 'Nephrology', 'Oncology', 'Family medicine',
];

const DAYS = ['All Days', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DAY_NAMES: Record<string, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};

const STATES = [
  '', 'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti',
  'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

export default function ClinicSchedulesPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ClinicFilters>({ limit: 18 });
  const [search, setSearch] = useState('');

  const { data, meta, isLoading, error, refetch } = useQuery<ClinicSchedule[]>(
    () => clinicSchedulesApi.list({ ...filters, page }),
    [filters, page],
  );

  const update = useCallback((partial: Partial<ClinicFilters>) => {
    setFilters((f) => ({ ...f, ...partial }));
    setPage(1);
  }, []);

  const total = meta?.total ?? 0;
  const totalPages = meta?.total_pages ?? 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Clinic Schedules</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isLoading ? (
              <span className="skeleton inline-block w-32 h-4 rounded" />
            ) : (
              <><span className="font-semibold text-slate-800">{total.toLocaleString()}</span> clinic schedules across Nigerian hospitals</>
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
              placeholder="Search by clinic or hospital name..."
              className="input pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
            value={filters.specialty ?? ''}
            onChange={(e) => update({ specialty: e.target.value || undefined })}
          >
            {SPECIALTIES.map((s) => (
              <option key={s} value={s === 'All Specialties' ? '' : s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="select w-full sm:w-40"
            value={filters.day ?? ''}
            onChange={(e) => update({ day: e.target.value || undefined })}
          >
            {DAYS.map((d) => (
              <option key={d} value={d === 'All Days' ? '' : d.toLowerCase()}>
                {d}
              </option>
            ))}
          </select>
          <select
            className="select w-full sm:w-44"
            value={filters.referral_required ?? ''}
            onChange={(e) => update({ referral_required: (e.target.value as any) || undefined })}
          >
            <option value="">Referral: Any</option>
            <option value="false">Walk-in Only</option>
            <option value="true">Referral Required</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data?.length ? (
        <EmptyState
          title="No clinic schedules found"
          description="Try adjusting your filters or search query."
          action={
            <button onClick={() => { setFilters({ limit: 18 }); setPage(1); }} className="btn-outline">
              Clear filters
            </button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.map((s) => (
              <div key={s.id} className="card p-5 flex flex-col gap-4 hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight">{s.clinicName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {s.facility?.name} · {s.facility?.state?.name}
                    </p>
                  </div>
                  <VerificationBadge status={s.verificationStatus as any} />
                </div>

                <div className="flex flex-wrap gap-2">
                  {s.specialty && <span className="badge-blue">{s.specialty.name}</span>}
                  {s.referralRequired
                    ? <span className="badge-amber">Referral needed</span>
                    : <span className="badge-green">Walk-in</span>}
                </div>

                <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CalendarDays size={14} className="text-slate-400" />
                    <span className="font-medium">{DAY_NAMES[s.dayOfWeek] ?? s.dayOfWeek}</span>
                  </div>
                  <span className="font-mono text-slate-700 font-semibold">
                    {s.startTime} – {s.endTime}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                className="btn-outline py-1.5 px-3 text-xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-sm text-slate-500">Page {page} of {totalPages.toLocaleString()}</span>
              <button
                className="btn-outline py-1.5 px-3 text-xs"
                disabled={!meta?.has_next_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

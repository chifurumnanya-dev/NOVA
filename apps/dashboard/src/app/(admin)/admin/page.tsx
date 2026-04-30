'use client';

import { Building2, CalendarDays, Map, CheckCircle2, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import dynamic from 'next/dynamic';
import StatCard from '@/components/StatCard';
import { FacilitiesByStateChart, FacilitiesByTypeChart } from '@/components/Charts';
import { StatCardSkeleton, TableRowSkeleton, ChartSkeleton } from '@/components/Skeletons';
import { ErrorState, EmptyState } from '@/components/States';
import { VerificationBadge, FacilityTypeBadge } from '@/components/Badges';
import { useQuery } from '@/hooks/useQuery';
import { metaApi, facilitiesApi, type GlobalStats, type Facility } from '@/lib/api';

const NigeriaMap = dynamic(() => import('@/components/NigeriaMap'), { ssr: false });

const COVERAGE_TABLE = [
  { state: 'Lagos', facilities: 1420, coverage: 98 },
  { state: 'Kano', facilities: 980, coverage: 87 },
  { state: 'Rivers', facilities: 850, coverage: 82 },
  { state: 'Oyo', facilities: 730, coverage: 79 },
  { state: 'FCT', facilities: 620, coverage: 91 },
  { state: 'Kaduna', facilities: 590, coverage: 74 },
];

const LEAST_COVERED = [
  { state: 'Ebonyi', coverage: 28 },
  { state: 'Zamfara', coverage: 31 },
  { state: 'Kebbi', coverage: 35 },
  { state: 'Yobe', coverage: 37 },
];

export default function DashboardPage() {
  const stats = useQuery<GlobalStats>(() => metaApi.stats(), []);
  const recent = useQuery<Facility[]>(() => facilitiesApi.list({ limit: 5, page: 1 }), []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">Platform Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Live coverage across Nigeria's 36 states and FCT</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : stats.error ? (
          <div className="col-span-4">
            <ErrorState message={stats.error} onRetry={stats.refetch} />
          </div>
        ) : (
          <>
            <StatCard
              label="Total Facilities"
              value={stats.data?.total_facilities ?? 0}
              icon={Building2}
              color="green"
              description="Across 36 states + FCT"
            />
            <StatCard
              label="Clinic Schedules"
              value={stats.data?.total_clinic_schedules ?? 0}
              icon={CalendarDays}
              color="blue"
              description="Linked to verified hospitals"
            />
            <StatCard
              label="States Covered"
              value={stats.data?.states_covered ?? 0}
              icon={Map}
              color="purple"
              description="36 states + FCT"
            />
            <StatCard
              label="Verified Records"
              value={stats.data?.verified_facilities ?? 0}
              icon={CheckCircle2}
              color="amber"
              description={stats.data ? `${Math.round((stats.data.verified_facilities / stats.data.total_facilities) * 100)}% verification rate` : ''}
            />
          </>
        )}
      </div>

      {/* Map + Coverage */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="section-title">Facility Coverage Map</h2>
              <p className="text-xs text-slate-500 mt-0.5">Click any state for details</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary text-xs py-1.5">Facilities</button>
              <button className="btn-outline text-xs py-1.5">Schedules</button>
            </div>
          </div>
          <div className="h-[440px] p-1">
            <NigeriaMap />
          </div>
        </div>

        <div className="card flex flex-col">
          <div className="card-header">
            <h2 className="section-title">Most Covered States</h2>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-header px-4 py-3 text-left">State</th>
                  <th className="table-header px-4 py-3 text-right">Facilities</th>
                  <th className="table-header px-4 py-3 text-right">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {COVERAGE_TABLE.map((row) => (
                  <tr key={row.state} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="table-cell font-medium">{row.state}</td>
                    <td className="table-cell text-right tabular-nums">{row.facilities.toLocaleString()}</td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${row.coverage}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-600 w-8">{row.coverage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={14} className="text-amber-500" />
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Needs Attention</h3>
            </div>
            {LEAST_COVERED.map((s) => (
              <div key={s.state} className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-700">{s.state}</span>
                <span className="text-amber-600 font-semibold">{s.coverage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Facilities by State (Top 8)</h2>
          </div>
          <div className="p-4">
            <FacilitiesByStateChart />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Facilities by Type</h2>
          </div>
          <div className="p-4">
            <FacilitiesByTypeChart />
          </div>
        </div>
      </div>

      {/* Recently Added */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            <h2 className="section-title">Recently Added Facilities</h2>
          </div>
          <a href="/admin/facilities" className="text-sm text-green-600 hover:text-green-700 font-medium">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="table-header px-4 py-3 text-left">Name</th>
                <th className="table-header px-4 py-3 text-left">State</th>
                <th className="table-header px-4 py-3 text-left">Type</th>
                <th className="table-header px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
              ) : recent.error ? (
                <tr>
                  <td colSpan={4}>
                    <ErrorState message={recent.error} onRetry={recent.refetch} />
                  </td>
                </tr>
              ) : !recent.data?.length ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState title="No facilities yet" description="Facilities will appear here once data is seeded." />
                  </td>
                </tr>
              ) : (
                recent.data.map((f) => (
                  <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="table-cell font-medium">
                      <a href={`/admin/facilities/${f.id}`} className="hover:text-green-600 transition-colors">{f.name}</a>
                    </td>
                    <td className="table-cell">{f.state?.name}</td>
                    <td className="table-cell">
                      <FacilityTypeBadge type={f.facilityType} />
                    </td>
                    <td className="table-cell">
                      <VerificationBadge status={f.verificationStatus as any} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data quality indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <div className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">
                  {stats.data ? `${Math.round((stats.data.verified_facilities / stats.data.total_facilities) * 100)}%` : '—'}
                </p>
                <p className="text-xs text-slate-500">Verification Rate</p>
              </div>
            </div>
            <div className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{stats.data?.lgas_covered ?? '—'}</p>
                <p className="text-xs text-slate-500">LGAs Covered</p>
              </div>
            </div>
            <div className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertCircle size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">
                  {stats.data ? (stats.data.total_facilities - stats.data.verified_facilities).toLocaleString() : '—'}
                </p>
                <p className="text-xs text-slate-500">Unverified Records</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

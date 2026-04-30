'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Users, AlertCircle, FileText } from 'lucide-react';
import { VerificationBadge } from '@/components/Badges';
import { useToast } from '@/components/Toast';
import { ConfirmModal, useModal } from '@/components/Modal';

const PENDING = [
  { id: 'c1', type: 'facility', name: 'Central Hospital Maiduguri', state: 'Borno', submitter: 'drfahad@health.gov.ng', submittedAt: '2026-04-26T10:23:00Z' },
  { id: 'c2', type: 'clinic_schedule', name: 'Ophthalmology Clinic @ LUTH', state: 'Lagos', submitter: 'community@nova.ng', submittedAt: '2026-04-27T08:10:00Z' },
  { id: 'c3', type: 'facility', name: 'Obi Integrated Specialist Hospital', state: 'Anambra', submitter: 'anon', submittedAt: '2026-04-27T14:30:00Z' },
  { id: 'c4', type: 'clinic_schedule', name: 'Nephrology Clinic @ AKTH', state: 'Kano', submitter: 'kano.health@ng.gov', submittedAt: '2026-04-25T09:00:00Z' },
];

const STALE = [
  { id: 's1', name: 'Kaltungo General Hospital', state: 'Gombe', lastVerified: '2024-11-01' },
  { id: 's2', name: 'PHC Fika', state: 'Yobe', lastVerified: '2024-09-15' },
  { id: 's3', name: 'Birniwa Hospital', state: 'Jigawa', lastVerified: '2024-08-20' },
];

const AUDIT_LOGS = [
  { id: 'a1', action: 'CONTRIBUTION_APPROVED', entity: 'Reddington Hospital Lagos', by: 'admin@nova.ng', at: '2026-04-27T09:00:00Z' },
  { id: 'a2', action: 'CONTRIBUTION_REJECTED', entity: 'PHC Duplicate Entry', by: 'admin@nova.ng', at: '2026-04-27T08:30:00Z' },
  { id: 'a3', action: 'FACILITY_UPDATED', entity: 'LUTH', by: 'admin@nova.ng', at: '2026-04-26T17:00:00Z' },
  { id: 'a4', action: 'CONTRIBUTION_APPROVED', entity: 'Antenatal Clinic UCH', by: 'reviewer@nova.ng', at: '2026-04-26T14:20:00Z' },
];

const ACTION_COLORS: Record<string, string> = {
  CONTRIBUTION_APPROVED: 'badge-green',
  CONTRIBUTION_REJECTED: 'badge-red',
  FACILITY_UPDATED: 'badge-blue',
};

export default function AdminPage() {
  const toast = useToast();
  const approveModal = useModal();
  const rejectModal = useModal();
  const [pending, setPending] = useState(PENDING);
  const [selected, setSelected] = useState<typeof PENDING[0] | null>(null);
  const [acting, setActing] = useState(false);

  const openApprove = (item: typeof PENDING[0]) => { setSelected(item); approveModal.onOpen(); };
  const openReject  = (item: typeof PENDING[0]) => { setSelected(item); rejectModal.onOpen(); };

  const handleApprove = async () => {
    setActing(true);
    // Simulate API call — in production: await adminApi.review(selected.id, 'approved')
    await new Promise((r) => setTimeout(r, 800));
    setPending((p) => p.filter((x) => x.id !== selected!.id));
    toast.success('Contribution approved', `"${selected!.name}" has been published.`);
    approveModal.onClose();
    setActing(false);
  };

  const handleReject = async () => {
    setActing(true);
    await new Promise((r) => setTimeout(r, 800));
    setPending((p) => p.filter((x) => x.id !== selected!.id));
    toast.warning('Contribution rejected', `"${selected!.name}" has been rejected.`);
    rejectModal.onClose();
    setActing(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Review contributions, monitor data quality, and manage records</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Pending Review', value: pending.length, icon: Clock, color: 'bg-amber-50 text-amber-600' },
          { label: 'Approved Today', value: 23, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
          { label: 'Stale Records', value: 430, icon: AlertCircle, color: 'bg-red-50 text-red-600' },
          { label: 'Total Contributors', value: '1,240', icon: Users, color: 'bg-blue-50 text-blue-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={16} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending Contributions */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-amber-500" />
            <h2 className="section-title">Pending Contributions</h2>
          </div>
          <span className="badge-amber">{pending.length} pending</span>
        </div>

        {pending.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <CheckCircle2 size={32} className="mx-auto mb-3 text-green-300" />
            All contributions reviewed — inbox is clear!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="table-header px-4 py-3 text-left">Submission</th>
                  <th className="table-header px-4 py-3 text-left">Type</th>
                  <th className="table-header px-4 py-3 text-left">State</th>
                  <th className="table-header px-4 py-3 text-left">Submitted By</th>
                  <th className="table-header px-4 py-3 text-left">Date</th>
                  <th className="table-header px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="table-cell font-medium text-slate-900">{c.name}</td>
                    <td className="table-cell">
                      <span className="badge-slate">{c.type === 'facility' ? 'Facility' : 'Clinic Schedule'}</span>
                    </td>
                    <td className="table-cell">{c.state}</td>
                    <td className="table-cell text-slate-500 text-xs">{c.submitter}</td>
                    <td className="table-cell text-xs text-slate-500">
                      {new Date(c.submittedAt).toLocaleDateString('en-NG', { dateStyle: 'short' })}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openApprove(c)} className="btn-primary text-xs py-1 px-2.5 gap-1">
                          <CheckCircle2 size={12} /> Approve
                        </button>
                        <button onClick={() => openReject(c)} className="btn text-xs py-1 px-2.5 gap-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl">
                          <XCircle size={12} /> Reject
                        </button>
                        <button className="btn-ghost text-xs py-1 px-2.5">
                          <FileText size={12} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Stale Records */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-red-500" />
              <h2 className="section-title">Stale Records</h2>
            </div>
            <span className="badge-red">Needs action</span>
          </div>
          <div className="p-2">
            {STALE.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.state} · Last verified: {s.lastVerified}</p>
                </div>
                <button
                  className="btn-outline text-xs py-1 px-2.5"
                  onClick={() => toast.info('Review started', `Opening ${s.name} for review.`)}
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Recent Audit Log</h2>
          </div>
          <div className="p-2">
            {AUDIT_LOGS.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="mt-0.5">
                  <span className={`${ACTION_COLORS[log.action] || 'badge-slate'} text-[10px]`}>{log.action}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{log.entity}</p>
                  <p className="text-xs text-slate-400">
                    {log.by} · {new Date(log.at).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Approve Modal */}
      <ConfirmModal
        open={approveModal.open}
        onClose={approveModal.onClose}
        onConfirm={handleApprove}
        loading={acting}
        title="Approve contribution?"
        message={`This will publish "${selected?.name}" to the NOVA database. This action is visible in the audit log.`}
        confirmLabel="Yes, approve"
        cancelLabel="Cancel"
        variant="primary"
      />

      {/* Confirm Reject Modal */}
      <ConfirmModal
        open={rejectModal.open}
        onClose={rejectModal.onClose}
        onConfirm={handleReject}
        loading={acting}
        title="Reject contribution?"
        message={`This will reject "${selected?.name}". The submitter will not be automatically notified.`}
        confirmLabel="Yes, reject"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}

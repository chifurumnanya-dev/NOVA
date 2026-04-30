interface VerificationStatus {
  status: 'unverified' | 'community_submitted' | 'source_verified' | 'admin_verified' | 'stale' | 'rejected';
}

const STATUS_CONFIG = {
  admin_verified: { label: 'Verified', className: 'badge-green' },
  source_verified: { label: 'Source Verified', className: 'badge-blue' },
  community_submitted: { label: 'Community', className: 'badge-amber' },
  unverified: { label: 'Unverified', className: 'badge-slate' },
  stale: { label: 'Stale', className: 'badge-amber' },
  rejected: { label: 'Rejected', className: 'badge-red' },
};

export function VerificationBadge({ status }: VerificationStatus) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unverified;
  return <span className={config.className}>{config.label}</span>;
}

export function FacilityTypeBadge({ type }: { type: string }) {
  const label = type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  let className = 'badge-slate';
  if (type === 'teaching_hospital') className = 'bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider';
  if (type === 'federal_medical_centre') className = 'bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider';
  
  return <span className={className}>{label}</span>;
}

export function OwnershipBadge({ ownership }: { ownership: string }) {
  const map: Record<string, string> = {
    public: 'badge-blue',
    private: 'badge-slate',
    mission: 'badge-amber',
    ngo: 'badge-green',
    military: 'badge-slate',
  };
  return <span className={map[ownership] || 'badge-slate'}>{ownership.charAt(0).toUpperCase() + ownership.slice(1)}</span>;
}

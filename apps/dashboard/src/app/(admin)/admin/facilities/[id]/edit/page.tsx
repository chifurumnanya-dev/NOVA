'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Loader2, ArrowLeft } from 'lucide-react';
import { useQuery } from '@/hooks/useQuery';
import { facilitiesApi, metaApi, type Facility, type State } from '@/lib/api';
import { ErrorState } from '@/components/States';
import { Skeleton } from '@/components/Skeletons';

export default function EditFacilityPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Facility>>({});

  const { data: f, isLoading: isFacilityLoading, error: facilityError } = useQuery<Facility>(
    () => facilitiesApi.getById(params.id),
    [params.id]
  );

  const { data: statesList } = useQuery<State[]>(() => metaApi.states(), []);

  useEffect(() => {
    if (f) {
      setFormData({
        name: f.name,
        facilityType: f.facilityType,
        ownership: f.ownership,
        address: f.address,
        phone: f.phone,
        email: f.email,
        website: f.website,
        openingHours: f.openingHours,
        latitude: f.latitude,
        longitude: f.longitude,
        ward: f.ward,
        verificationStatus: f.verificationStatus,
        dataSource: f.dataSource,
        externalId: f.externalId,
        externalCode: f.externalCode,
      });
    }
  }, [f]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await facilitiesApi.update(params.id, formData);
      router.push(`/admin/facilities/${params.id}`);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update facility');
    } finally {
      setIsSaving(false);
    }
  }

  if (isFacilityLoading) return <Skeleton className="w-full h-96 rounded-2xl" />;
  if (facilityError) return <ErrorState message={facilityError} />;
  if (!f) return null;

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-500" />
          </button>
          <h1 className="page-title">Edit Facility</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="label">Facility Name</label>
              <input
                type="text"
                className="input"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Facility Type</label>
              <select
                className="select"
                required
                value={formData.facilityType || ''}
                onChange={(e) => setFormData({ ...formData, facilityType: e.target.value })}
              >
                <optgroup label="Tertiary Institutions">
                  <option value="teaching_hospital">Teaching Hospital</option>
                  <option value="federal_medical_centre">Federal Medical Centre (FMC)</option>
                  <option value="specialist_hospital">Specialist Hospital</option>
                </optgroup>
                <optgroup label="Secondary & Primary">
                  <option value="general_hospital">General Hospital</option>
                  <option value="primary_health_centre">Primary Health Centre (PHC)</option>
                  <option value="maternity_centre">Maternity Centre</option>
                </optgroup>
                <optgroup label="Private & Specialized">
                  <option value="private_hospital">Private Hospital</option>
                  <option value="mission_hospital">Mission Hospital</option>
                  <option value="diagnostic_centre">Diagnostic Centre</option>
                  <option value="laboratory">Laboratory</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="dialysis_centre">Dialysis Centre</option>
                  <option value="emergency_centre">Emergency Centre</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label className="label">Ownership</label>
              <select
                className="select"
                required
                value={formData.ownership || ''}
                onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="mission">Mission</option>
                <option value="ngo">NGO</option>
                <option value="military">Military</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Location & Contact</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="label">Street Address</label>
              <textarea
                className="input h-20"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Ward</label>
              <input
                type="text"
                className="input"
                value={formData.ward || ''}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input
                type="text"
                className="input"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Latitude</label>
              <input
                type="number"
                step="any"
                className="input"
                value={formData.latitude ?? ''}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || null })}
              />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input
                type="number"
                step="any"
                className="input"
                value={formData.longitude ?? ''}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || null })}
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Additional Details</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Website</label>
              <input
                type="url"
                className="input"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="label">Opening Hours</label>
              <input
                type="text"
                className="input"
                value={formData.openingHours || ''}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Verification Status</label>
              <select
                className="select"
                value={formData.verificationStatus || ''}
                onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
              >
                <option value="unverified">Unverified</option>
                <option value="community_submitted">Community Submitted</option>
                <option value="source_verified">Source Verified</option>
                <option value="admin_verified">Admin Verified</option>
                <option value="stale">Stale</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="label">Data Source</label>
              <input
                type="text"
                className="input"
                value={formData.dataSource || ''}
                onChange={(e) => setFormData({ ...formData, dataSource: e.target.value })}
              />
            </div>
            <div>
              <label className="label">NHFR UID</label>
              <input
                type="text"
                className="input font-mono"
                value={formData.externalId || ''}
                onChange={(e) => setFormData({ ...formData, externalId: e.target.value })}
              />
            </div>
            <div>
              <label className="label">NHFR Code</label>
              <input
                type="text"
                className="input font-mono"
                value={formData.externalCode || ''}
                onChange={(e) => setFormData({ ...formData, externalCode: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-outline"
            disabled={isSaving}
          >
            <X size={16} /> Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving}
          >
            {isSaving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving…</>
            ) : (
              <><Save size={16} /> Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

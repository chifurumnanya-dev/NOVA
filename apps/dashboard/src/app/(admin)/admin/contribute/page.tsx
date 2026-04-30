'use client';

import { useState, useCallback } from 'react';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { contributionsApi } from '@/lib/api';

const FACILITY_TYPES = [
  'teaching_hospital', 'federal_medical_centre', 'general_hospital',
  'primary_health_centre', 'private_hospital', 'mission_hospital',
  'specialist_hospital', 'diagnostic_centre', 'laboratory', 'pharmacy',
  'maternity_centre', 'dialysis_centre', 'emergency_centre',
];

const SERVICES = [
  'Emergency care', 'Maternity care', 'Antenatal care', 'Immunisation',
  'Paediatrics', 'Surgery', 'Internal medicine', 'Cardiology', 'Dialysis',
  'Laboratory services', 'Radiology', 'Mental health', 'HIV services',
  'TB services', 'Family planning', 'Dental care', 'Eye care',
];

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const SPECIALTIES = [
  'Cardiology', 'Paediatrics', 'Obstetrics and Gynaecology', 'Surgery',
  'Orthopaedics', 'Ophthalmology', 'ENT', 'Dermatology', 'Psychiatry',
  'Neurology', 'Nephrology', 'Oncology', 'Family medicine',
];

export default function ContributePage() {
  const toast = useToast();
  const [tab, setTab] = useState<'facility' | 'schedule'>('facility');
  const [submitting, setSubmitting] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Facility form state
  const [facilityForm, setFacilityForm] = useState({
    name: '', facilityType: '', ownership: '', state: '', lga: '',
    address: '', phone: '', email: '', latitude: '', longitude: '',
    dataSource: '', submitterEmail: '',
  });

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    facilityId: '', clinicName: '', specialty: '', dayOfWeek: '',
    startTime: '', endTime: '', appointmentProcess: '', referralRequired: false,
    notes: '', submitterEmail: '',
  });

  const toggleService = useCallback((s: string) => {
    setSelectedServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }, []);

  const handleFacilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await contributionsApi.submitFacility({
        ...facilityForm,
        latitude: facilityForm.latitude ? parseFloat(facilityForm.latitude) : undefined,
        longitude: facilityForm.longitude ? parseFloat(facilityForm.longitude) : undefined,
        services: selectedServices,
      });
      toast.success(
        'Contribution received!',
        'Your submission is pending admin review and will be added once approved.',
      );
      // Reset form
      setFacilityForm({ name: '', facilityType: '', ownership: '', state: '', lga: '', address: '', phone: '', email: '', latitude: '', longitude: '', dataSource: '', submitterEmail: '' });
      setSelectedServices([]);
    } catch (err: any) {
      toast.error('Submission failed', err?.message ?? 'Please check your data and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await contributionsApi.submitClinicSchedule(scheduleForm);
      toast.success(
        'Schedule submitted!',
        'Your clinic schedule is pending admin review.',
      );
      setScheduleForm({ facilityId: '', clinicName: '', specialty: '', dayOfWeek: '', startTime: '', endTime: '', appointmentProcess: '', referralRequired: false, notes: '', submitterEmail: '' });
    } catch (err: any) {
      toast.error('Submission failed', err?.message ?? 'Please check your data and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateFacility = (k: string, v: string) => setFacilityForm((f) => ({ ...f, [k]: v }));
  const updateSchedule = (k: string, v: string | boolean) => setScheduleForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Contribute Data</h1>
        <p className="text-sm text-slate-500 mt-1">
          Help improve NOVA by adding or correcting health facility and clinic schedule data.
        </p>
      </div>

      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
        <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-amber-800">
          All contributions are reviewed before publication. Please provide accurate information and cite your sources.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[{ id: 'facility', label: 'New Facility' }, { id: 'schedule', label: 'Clinic Schedule' }].map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id as any)} className={tab === id ? 'btn-primary' : 'btn-outline'}>
            {label}
          </button>
        ))}
      </div>

      {/* Facility Form */}
      {tab === 'facility' && (
        <form onSubmit={handleFacilitySubmit} className="card p-6 space-y-5">
          <h2 className="section-title">Facility Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Facility Name *</label>
              <input required className="input" value={facilityForm.name} onChange={(e) => updateFacility('name', e.target.value)} placeholder="e.g. Ikeja General Hospital" />
            </div>
            <div>
              <label className="label">Facility Type *</label>
              <select required className="select" value={facilityForm.facilityType} onChange={(e) => updateFacility('facilityType', e.target.value)}>
                <option value="">Select type</option>
                {FACILITY_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Ownership *</label>
              <select required className="select" value={facilityForm.ownership} onChange={(e) => updateFacility('ownership', e.target.value)}>
                <option value="">Select ownership</option>
                {['public', 'private', 'mission', 'ngo', 'military'].map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">State *</label>
              <select required className="select" value={facilityForm.state} onChange={(e) => updateFacility('state', e.target.value)}>
                <option value="">Select state</option>
                {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">LGA</label>
              <input className="input" value={facilityForm.lga} onChange={(e) => updateFacility('lga', e.target.value)} placeholder="e.g. Ikeja" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <input className="input" value={facilityForm.address} onChange={(e) => updateFacility('address', e.target.value)} placeholder="Full street address" />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input type="tel" className="input" value={facilityForm.phone} onChange={(e) => updateFacility('phone', e.target.value)} placeholder="+234..." />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={facilityForm.email} onChange={(e) => updateFacility('email', e.target.value)} placeholder="info@facility.com" />
            </div>
            <div>
              <label className="label">Latitude</label>
              <input type="number" step="any" className="input" value={facilityForm.latitude} onChange={(e) => updateFacility('latitude', e.target.value)} placeholder="e.g. 6.5044" />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input type="number" step="any" className="input" value={facilityForm.longitude} onChange={(e) => updateFacility('longitude', e.target.value)} placeholder="e.g. 3.3792" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Data Source</label>
              <input className="input" value={facilityForm.dataSource} onChange={(e) => updateFacility('dataSource', e.target.value)} placeholder="e.g. Federal Ministry of Health, field visit" />
            </div>
          </div>

          <div>
            <label className="label">Services Offered</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {SERVICES.map((s) => (
                <button key={s} type="button" onClick={() => toggleService(s)}
                  className={`badge cursor-pointer transition-all ${selectedServices.includes(s) ? 'badge-green ring-1 ring-green-400' : 'badge-slate hover:bg-slate-200'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <label className="label">Your Email (Optional)</label>
            <input type="email" className="input" value={facilityForm.submitterEmail} onChange={(e) => updateFacility('submitterEmail', e.target.value)} placeholder="For follow-up" />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3">
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting…
              </span>
            ) : (
              <><Upload size={16} /> Submit Contribution</>
            )}
          </button>
        </form>
      )}

      {/* Clinic Schedule Form */}
      {tab === 'schedule' && (
        <form onSubmit={handleScheduleSubmit} className="card p-6 space-y-5">
          <h2 className="section-title">Clinic Schedule Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Facility ID or Name *</label>
              <input required className="input" value={scheduleForm.facilityId} onChange={(e) => updateSchedule('facilityId', e.target.value)} placeholder="Facility UUID or name" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Clinic Name *</label>
              <input required className="input" value={scheduleForm.clinicName} onChange={(e) => updateSchedule('clinicName', e.target.value)} placeholder="e.g. Cardiology Outpatient Clinic" />
            </div>
            <div>
              <label className="label">Specialty</label>
              <select className="select" value={scheduleForm.specialty} onChange={(e) => updateSchedule('specialty', e.target.value)}>
                <option value="">Select specialty</option>
                {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Day of Week *</label>
              <select required className="select" value={scheduleForm.dayOfWeek} onChange={(e) => updateSchedule('dayOfWeek', e.target.value)}>
                <option value="">Select day</option>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                  <option key={d} value={d.toLowerCase()}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Start Time *</label>
              <input required type="time" className="input" value={scheduleForm.startTime} onChange={(e) => updateSchedule('startTime', e.target.value)} />
            </div>
            <div>
              <label className="label">End Time *</label>
              <input required type="time" className="input" value={scheduleForm.endTime} onChange={(e) => updateSchedule('endTime', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Appointment Process</label>
              <textarea className="input resize-none" rows={2} value={scheduleForm.appointmentProcess} onChange={(e) => updateSchedule('appointmentProcess', e.target.value)} placeholder="e.g. Walk-in, tickets issued from 7am..." />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <input type="checkbox" id="referral" className="w-4 h-4 text-green-600 rounded"
                checked={scheduleForm.referralRequired}
                onChange={(e) => updateSchedule('referralRequired', e.target.checked)} />
              <label htmlFor="referral" className="text-sm text-slate-700 font-medium">Referral Required</label>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <textarea className="input resize-none" rows={2} value={scheduleForm.notes} onChange={(e) => updateSchedule('notes', e.target.value)} placeholder="Any additional information..." />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Your Email (Optional)</label>
              <input type="email" className="input" value={scheduleForm.submitterEmail} onChange={(e) => updateSchedule('submitterEmail', e.target.value)} placeholder="For follow-up" />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3">
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting…
              </span>
            ) : (
              <><Upload size={16} /> Submit Contribution</>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

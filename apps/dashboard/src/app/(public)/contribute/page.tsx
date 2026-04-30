'use client';

import { useState, useRef } from 'react';
import { CheckCircle, ChevronDown, Github, FileText, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { API_BASE_V1_URL } from '@/lib/config';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
];

const FACILITY_TYPES = [
  'Teaching Hospital', 'Federal Medical Centre', 'General Hospital',
  'Primary Health Centre', 'Private Hospital', 'Specialist Hospital',
  'Diagnostic Centre', 'Pharmacy', 'Maternity Centre',
];

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function PublicContributePage() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const fd = new FormData(e.currentTarget);
    const body = {
      facilityName: fd.get('facilityName'),
      facilityType: fd.get('facilityType'),
      state: fd.get('state'),
      lga: fd.get('lga'),
      address: fd.get('address'),
      phone: fd.get('phone'),
      latitude: fd.get('latitude') ? parseFloat(fd.get('latitude') as string) : undefined,
      longitude: fd.get('longitude') ? parseFloat(fd.get('longitude') as string) : undefined,
      notes: fd.get('notes'),
      contributorName: fd.get('contributorName'),
      contributorContact: fd.get('contributorContact'),
    };

    try {
      const res = await fetch(`${API_BASE_V1_URL}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Submission failed');
      setStatus('success');
      formRef.current?.reset();
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again or use the GitHub option below.');
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      {/* Page header */}
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Contribute a Facility</h1>
      <p className="mt-3 text-slate-500 text-base leading-relaxed">
        Help build the most complete directory of Nigerian health facilities. There are two ways to contribute:
      </p>

      <div className="mt-10 space-y-10">
        {/* ─── Option 1: Form ─── */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
          {status === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900">Submission received!</h2>
              <p className="mt-2 text-slate-500 text-sm">
                Thank you! Our team will review and verify your submission shortly.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-6 px-5 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Submit another
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-green-600 mb-1">Option 1: Submit via Form</h2>
              <p className="text-sm text-slate-500 mb-6">Fill out the form below and we'll review your submission.</p>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                {/* Facility Name */}
                <Field label="Facility Name" required>
                  <input
                    name="facilityName"
                    required
                    placeholder="e.g. Lagos University Teaching Hospital"
                    className="form-input"
                  />
                </Field>

                {/* Type */}
                <Field label="Facility Type" required>
                  <div className="relative">
                    <select name="facilityType" required defaultValue="" className="form-input appearance-none pr-9">
                      <option value="" disabled>Select type…</option>
                      {FACILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </Field>

                {/* State + LGA */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="State" required>
                    <div className="relative">
                      <select name="state" required defaultValue="" className="form-input appearance-none pr-9">
                        <option value="" disabled>Select state…</option>
                        {NIGERIAN_STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </Field>
                  <Field label="Local Government Area" required>
                    <input name="lga" required placeholder="e.g. Eti-Osa" className="form-input" />
                  </Field>
                </div>

                {/* Address */}
                <Field label="Street Address">
                  <input name="address" placeholder="e.g. 1 University Road, Yaba" className="form-input" />
                </Field>

                {/* Phone */}
                <Field label="Phone Number">
                  <input name="phone" type="tel" placeholder="e.g. +234 80 1234 5678" className="form-input" />
                </Field>

                {/* Coordinates */}
                <div>
                  <p className="block text-sm font-medium text-slate-700 mb-1">
                    Location <span className="text-slate-400 font-normal text-xs ml-1">— optional, enter coordinates manually</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <input name="latitude" type="number" step="any" placeholder="Latitude (e.g. 6.5244)" className="form-input" />
                    <input name="longitude" type="number" step="any" placeholder="Longitude (e.g. 3.3792)" className="form-input" />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin size={10} /> You can get coordinates from Google Maps by right-clicking on a location.
                  </p>
                </div>

                {/* Notes */}
                <Field label="Additional Notes">
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Any other details, opening hours, services offered, etc."
                    className="form-input resize-none"
                  />
                </Field>

                {/* Contributor info */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Your info (optional)</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Your Name">
                      <input name="contributorName" placeholder="Anonymous" className="form-input" />
                    </Field>
                    <Field label="Email or Twitter (for credit)">
                      <input name="contributorContact" placeholder="you@example.com" className="form-input" />
                    </Field>
                  </div>
                </div>

                {status === 'error' && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-semibold text-sm transition-colors"
                >
                  {status === 'submitting' ? (
                    <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                  ) : (
                    <>Submit Facility <ArrowRight size={15} /></>
                  )}
                </button>
              </form>
            </>
          )}
        </section>

        {/* ─── Option 2: GitHub PR ─── */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-blue-600 mb-1">Option 2: Open a GitHub Pull Request</h2>
          <p className="text-sm text-slate-500 mb-5">
            If you have multiple facilities or prefer working with data directly, submit a PR to our dataset repository.
          </p>

          <ol className="space-y-4">
            {[
              { step: '1', text: 'Fork the NOVA repository on GitHub.' },
              { step: '2', text: 'Add or edit entries in datasets/facilities-sample.json following the existing schema.' },
              { step: '3', text: 'Open a Pull Request with a clear description of what you\'re adding.' },
            ].map(({ step, text }) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">{step}</span>
                <span className="text-sm text-slate-600">{text}</span>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://github.com/nova-ng/nova"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              <Github size={15} /> View on GitHub
            </a>
            <a
              href="https://github.com/nova-ng/nova/blob/main/datasets/facilities-sample.json"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <FileText size={15} /> View Data Schema
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { contributionsApi, type Facility } from '@/lib/api';

interface Props {
  facility: Facility;
  onClose: () => void;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface FormState {
  name: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  openingHours: string;
  reason: string;
  submitterName: string;
  submitterEmail: string;
}

export default function SuggestEditModal({ facility, onClose }: Props) {
  const [form, setForm] = useState<FormState>({
    name: facility.name,
    phone: facility.phone ?? '',
    email: facility.email ?? '',
    website: facility.website ?? '',
    address: facility.address ?? '',
    openingHours: facility.openingHours ?? '',
    reason: '',
    submitterName: '',
    submitterEmail: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function buildPayload() {
    const diff: Record<string, unknown> = {};
    if (form.name.trim() && form.name.trim() !== facility.name) diff.name = form.name.trim();
    if (form.phone !== (facility.phone ?? '')) diff.phone = form.phone.trim();
    if (form.email !== (facility.email ?? '')) diff.email = form.email.trim();
    if (form.website !== (facility.website ?? '')) diff.website = form.website.trim();
    if (form.address !== (facility.address ?? '')) diff.address = form.address.trim();
    if (form.openingHours !== (facility.openingHours ?? '')) diff.openingHours = form.openingHours.trim();
    diff.reason = form.reason.trim();
    if (form.submitterName.trim()) diff.submitterName = form.submitterName.trim();
    if (form.submitterEmail.trim()) diff.submitterEmail = form.submitterEmail.trim();
    return diff;
  }

  const hasChanges = (() => {
    const p = buildPayload();
    return Object.keys(p).some((k) => k !== 'reason' && k !== 'submitterName' && k !== 'submitterEmail');
  })();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.reason.trim() || form.reason.trim().length < 5) {
      setErrorMsg('Please tell us briefly why you are suggesting this edit (at least 5 characters).');
      setStatus('error');
      return;
    }
    if (!hasChanges) {
      setErrorMsg('Change at least one field before submitting.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');
    try {
      await contributionsApi.suggestFacilityEdit(facility.id, buildPayload());
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.message ?? 'Submission failed. Please try again.');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Suggest an edit</h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              For <span className="text-slate-700 font-medium">{facility.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1 -m-1"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {status === 'success' ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle size={42} className="text-green-500 mx-auto" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Thanks for the suggestion!</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              A reviewer will verify your edit and update the record. You can close this dialog now.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-5 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="px-6 py-5 space-y-4">
              <p className="text-xs text-slate-500">
                Edit the fields you want to correct. We&rsquo;ll only consider changed fields, so leave the rest as they are.
              </p>

              <Field label="Name">
                <input
                  className="form-input-public"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Phone">
                  <input
                    className="form-input-public"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="+234 80 1234 5678"
                  />
                </Field>
                <Field label="Email">
                  <input
                    className="form-input-public"
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="contact@example.com"
                  />
                </Field>
              </div>

              <Field label="Website">
                <input
                  className="form-input-public"
                  type="url"
                  value={form.website}
                  onChange={(e) => update('website', e.target.value)}
                  placeholder="https://…"
                />
              </Field>

              <Field label="Address">
                <textarea
                  className="form-input-public resize-none"
                  rows={2}
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                />
              </Field>

              <Field label="Opening hours">
                <input
                  className="form-input-public"
                  value={form.openingHours}
                  onChange={(e) => update('openingHours', e.target.value)}
                  placeholder="Mon–Fri 8am–5pm"
                />
              </Field>

              <Field label="Why are you suggesting this edit?" required>
                <textarea
                  className="form-input-public resize-none"
                  rows={3}
                  value={form.reason}
                  onChange={(e) => update('reason', e.target.value)}
                  placeholder="e.g. The phone number changed, I called and confirmed."
                />
              </Field>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Your info (optional)
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Your name">
                    <input
                      className="form-input-public"
                      value={form.submitterName}
                      onChange={(e) => update('submitterName', e.target.value)}
                      placeholder="Anonymous"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      className="form-input-public"
                      type="email"
                      value={form.submitterEmail}
                      onChange={(e) => update('submitterEmail', e.target.value)}
                      placeholder="you@example.com"
                    />
                  </Field>
                </div>
              </div>

              {status === 'error' && errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:bg-green-600/50 transition-colors"
              >
                {status === 'submitting' && <Loader2 size={14} className="animate-spin" />}
                Submit suggestion
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

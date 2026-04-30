import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import SearchBar from '@/components/public/SearchBar';
import NigeriaTertiaryMap from '@/components/public/NigeriaTertiaryMap';

export default function PublicHome() {
  return (
    <div className="max-w-6xl mx-auto px-6 pb-16">
      {/* Hero with grid pattern */}
      <div className="relative pt-12 sm:pt-20 pb-8">
        {/* Grid pattern background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(34 197 94 / 0.18) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(34 197 94 / 0.18) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 100%)',
          }}
        />

        <div className="max-w-3xl mx-auto text-center relative">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-200 bg-green-50 text-[11px] uppercase tracking-[0.16em] text-green-700">
            <Sparkles size={11} />
            Open verified access
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Find a verified Nigerian
            <br />
            <span className="bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
              healthcare facility
            </span>
          </h1>
          <p className="mt-5 text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            Search hospitals and clinics across all 36 states. Get addresses, phone
            numbers, services, and live clinic schedules — backed by an open API.
          </p>

          <div className="mt-8 max-w-2xl mx-auto">
            <SearchBar size="lg" autoFocus />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="mt-10 sm:mt-14">
        <NigeriaTertiaryMap />
      </div>

      {/* Coverage cards */}
      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Top coverage</p>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            <strong className="text-slate-900">Lagos</strong> (3),{' '}
            <strong className="text-slate-900">Kaduna</strong> (4),{' '}
            <strong className="text-slate-900">Edo</strong> (2),{' '}
            <strong className="text-slate-900">Enugu</strong> (2),{' '}
            <strong className="text-slate-900">Ogun</strong> (2)
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Help us expand</p>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Looking for contributors in{' '}
            <span className="text-slate-700">Borno, Jigawa, Kebbi, Yobe, Zamfara</span>.
            <Link
              href="/contribute"
              className="ml-1 inline-flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors font-medium"
            >
              Contribute <ArrowRight size={12} />
            </Link>
          </p>
        </div>
      </div>

      {/* Why NOVA */}
      <div className="mt-20 grid sm:grid-cols-3 gap-px bg-slate-200 rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
        <Pillar
          title="Verified data"
          body="Every record carries a verification status, source, and confidence score — surface what's reliable, flag what's stale."
        />
        <Pillar
          title="Open API"
          body="Build apps, dashboards, and chatbots on top of NOVA. Free, rate-limited, and documented."
        />
        <Pillar
          title="Community-driven"
          body="Anyone can submit corrections or new facilities. Reviewers verify; everything is auditable."
        />
      </div>
    </div>
  );
}

function Pillar({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white p-6 sm:p-7">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{body}</p>
    </div>
  );
}

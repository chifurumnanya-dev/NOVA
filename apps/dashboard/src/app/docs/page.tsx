import { ExternalLink } from 'lucide-react';

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-100 text-green-700 border-green-200',
  POST: 'bg-blue-100 text-blue-700 border-blue-200',
  PATCH: 'bg-amber-100 text-amber-700 border-amber-200',
  DELETE: 'bg-red-100 text-red-700 border-red-200',
};

function MethodBadge({ method }: { method: keyof typeof METHOD_COLORS }) {
  return (
    <span
      className={`${METHOD_COLORS[method]} text-[10px] font-bold px-2 py-1 rounded-md font-mono border`}
    >
      {method}
    </span>
  );
}

function CodeBlock({ children, lang = 'json' }: { children: string; lang?: string }) {
  const accent = lang === 'bash' ? 'text-amber-300' : lang === 'error' ? 'text-red-300' : 'text-green-300';
  return (
    <pre className={`bg-slate-900 ${accent} text-xs px-4 py-3.5 rounded-xl overflow-x-auto font-mono leading-relaxed border border-slate-800`}>
      {children}
    </pre>
  );
}

function Endpoint({
  id,
  method,
  path,
  title,
  children,
}: {
  id: string;
  method: keyof typeof METHOD_COLORS;
  path: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-3 pt-2">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 tracking-tight">{title}</h3>
        <div className="flex items-center gap-2.5 mt-2">
          <MethodBadge method={method} />
          <code className="text-sm font-mono text-slate-700">{path}</code>
        </div>
      </div>
      <div className="space-y-3 text-sm text-slate-600 leading-relaxed">{children}</div>
    </section>
  );
}

function ParamTable({ rows }: { rows: { name: string; type: string; desc: string }[] }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-slate-50">
          <tr className="text-left text-slate-500">
            <th className="px-3 py-2 font-semibold">Parameter</th>
            <th className="px-3 py-2 font-semibold">Type</th>
            <th className="px-3 py-2 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.name} className="text-slate-700">
              <td className="px-3 py-2">
                <code className="font-mono text-green-700">{r.name}</code>
              </td>
              <td className="px-3 py-2 text-slate-500">{r.type}</td>
              <td className="px-3 py-2 text-slate-600">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SUCCESS_EXAMPLE = `{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Lagos University Teaching Hospital",
      "facilityType": "teaching_hospital",
      "ownership": "public",
      "state": { "name": "Lagos" },
      "lga": { "name": "Idi-Araba" },
      "verificationStatus": "admin_verified"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 10000,
    "total_pages": 500,
    "has_next_page": true
  }
}`;

const ERROR_EXAMPLE = `{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query parameters.",
    "details": { "facility_type": ["Invalid enum value"] }
  }
}`;

export default function DocsPage() {
  return (
    <article className="space-y-14">
      {/* HERO */}
      <header className="border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-mono font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">v1</span>
          <span className="text-[11px] font-mono text-slate-400">stable</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">NOVA API</h1>
        <p className="mt-3 text-base text-slate-600 leading-relaxed max-w-2xl">
          Public REST API for Nigerian healthcare data. Read facilities, clinic schedules, and
          metadata across all 36 states and the FCT — no key required for read access.
        </p>
        <div className="mt-5 flex items-center gap-2">
          <a href="/api/v1/health" target="_blank" rel="noopener noreferrer" className="btn-outline text-xs py-1.5">
            <ExternalLink size={12} /> Try Live API
          </a>
          <a href="#quick-start" className="btn-primary text-xs py-1.5">Quick start →</a>
        </div>
      </header>

      {/* OVERVIEW */}
      <section id="overview" className="scroll-mt-20 space-y-3">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          NOVA provides free, structured access to healthcare facility data across Nigeria.
          All read operations are public and unauthenticated. Write operations (contributions)
          are also open but enter a moderation queue before going live.
        </p>
        <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
          <li>RESTful conventions, JSON request and response bodies</li>
          <li>Versioned under <code className="bg-slate-100 px-1 rounded text-xs">/api/v1</code></li>
          <li>Stable response envelope: <code className="bg-slate-100 px-1 rounded text-xs">{`{ success, data, meta }`}</code></li>
          <li>Cursorless pagination via <code className="bg-slate-100 px-1 rounded text-xs">page</code> &amp; <code className="bg-slate-100 px-1 rounded text-xs">limit</code></li>
        </ul>
      </section>

      {/* BASE URL */}
      <section id="base-url" className="scroll-mt-20 space-y-3">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Base URL</h2>
        <p className="text-sm text-slate-600">All endpoints are served from a single base URL.</p>
        <CodeBlock lang="bash">https://api.nova.ng/api/v1</CodeBlock>
      </section>

      {/* AUTHENTICATION */}
      <section id="authentication" className="scroll-mt-20 space-y-3">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Authentication</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Read endpoints are open and require no credentials. To raise rate limits, generate an
          API key from the dashboard and pass it via the <code className="bg-slate-100 px-1 rounded text-xs">Authorization</code> header.
        </p>
        <CodeBlock lang="bash">{`curl https://api.nova.ng/api/v1/facilities \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</CodeBlock>
      </section>

      {/* RATE LIMITS */}
      <section id="rate-limits" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Rate Limits</h2>
        <p className="text-sm text-slate-600">
          Limits are tiered by credentials. Every response includes rate limit headers.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Anonymous', limit: '100 / hour' },
            { label: 'API Key', limit: '1,000 / day' },
            { label: 'Admin', limit: 'Elevated' },
          ].map(({ label, limit }) => (
            <div key={label} className="border border-slate-200 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
              <p className="text-base font-bold text-slate-900 mt-1">{limit}</p>
            </div>
          ))}
        </div>
        <div className="text-xs text-slate-500">
          Headers returned on every response:{' '}
          <code className="bg-slate-100 px-1 rounded">X-RateLimit-Limit</code>,{' '}
          <code className="bg-slate-100 px-1 rounded">X-RateLimit-Remaining</code>,{' '}
          <code className="bg-slate-100 px-1 rounded">X-RateLimit-Reset</code>.
        </div>
      </section>

      {/* QUICK START */}
      <section id="quick-start" className="scroll-mt-20 space-y-3">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Quick Start</h2>
        <p className="text-sm text-slate-600">
          The fastest way to get started: list facilities with a state filter.
        </p>
        <CodeBlock lang="bash">{`curl "https://api.nova.ng/api/v1/facilities?state=lagos&limit=5"`}</CodeBlock>
        <p className="text-sm text-slate-600">
          See <a href="#facilities-search" className="text-green-700 hover:underline">Search facilities</a> for
          full filtering, or <a href="#response-format" className="text-green-700 hover:underline">Response Format</a> for the envelope shape.
        </p>
      </section>

      {/* RESPONSE FORMAT */}
      <section id="response-format" className="scroll-mt-20 space-y-3">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Response Format</h2>
        <p className="text-sm text-slate-600">
          All successful responses share a stable envelope. List endpoints include pagination metadata
          under <code className="bg-slate-100 px-1 rounded text-xs">meta</code>.
        </p>
        <CodeBlock>{SUCCESS_EXAMPLE}</CodeBlock>
      </section>

      {/* ERRORS */}
      <section id="errors" className="scroll-mt-20 space-y-3">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Errors</h2>
        <p className="text-sm text-slate-600">
          Errors return a non-2xx status with a structured body. The <code className="bg-slate-100 px-1 rounded text-xs">code</code> field
          is stable and safe to branch on.
        </p>
        <CodeBlock lang="error">{ERROR_EXAMPLE}</CodeBlock>
        <ParamTable
          rows={[
            { name: 'VALIDATION_ERROR', type: '400', desc: 'Query or body failed schema validation.' },
            { name: 'NOT_FOUND', type: '404', desc: 'The requested resource does not exist.' },
            { name: 'RATE_LIMITED', type: '429', desc: 'You exceeded your tier’s limit. Retry after the reset window.' },
            { name: 'INTERNAL_ERROR', type: '500', desc: 'Unexpected server error. Safe to retry.' },
          ]}
        />
      </section>

      {/* FACILITIES GROUP */}
      <section className="scroll-mt-20 space-y-8 pt-2">
        <div className="border-t border-slate-200 pt-8">
          <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider">API Reference</p>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Facilities</h2>
          <p className="text-sm text-slate-600 mt-2">
            Health facilities — hospitals, clinics, primary health centres — with location,
            ownership, services and verification status.
          </p>
        </div>

        <Endpoint id="facilities-list" method="GET" path="/api/v1/facilities" title="List facilities">
          <p>Returns a paginated list of facilities. Filter by state, LGA, type, ownership, service, or verification status.</p>
          <ParamTable
            rows={[
              { name: 'state', type: 'string', desc: 'State slug, e.g. "lagos".' },
              { name: 'lga', type: 'string', desc: 'LGA slug within the chosen state.' },
              { name: 'facility_type', type: 'enum', desc: 'general_hospital, teaching_hospital, phc, clinic, …' },
              { name: 'ownership', type: 'enum', desc: 'public, private, faith_based, ngo' },
              { name: 'service', type: 'string', desc: 'Filter facilities offering this service.' },
              { name: 'verified', type: 'boolean', desc: 'Only return admin-verified facilities.' },
              { name: 'page', type: 'number', desc: 'Page number, default 1.' },
              { name: 'limit', type: 'number', desc: 'Page size, default 20, max 100.' },
            ]}
          />
          <CodeBlock lang="bash">{`curl "https://api.nova.ng/api/v1/facilities?state=lagos&service=dialysis&page=1"`}</CodeBlock>
        </Endpoint>

        <Endpoint id="facilities-get" method="GET" path="/api/v1/facilities/:id" title="Get a facility">
          <p>Fetch a single facility by its UUID. Returns the full record including services, contact details, and metadata provenance.</p>
          <CodeBlock lang="bash">{`curl https://api.nova.ng/api/v1/facilities/9c7d2a1f-...`}</CodeBlock>
        </Endpoint>

        <Endpoint id="facilities-search" method="GET" path="/api/v1/facilities/search" title="Search facilities">
          <p>Full-text search across facility names, with the same filters as the list endpoint.</p>
          <ParamTable
            rows={[
              { name: 'q', type: 'string', desc: 'Search query — matches name, alternate names, services.' },
              { name: 'state', type: 'string', desc: 'Optional state filter.' },
              { name: 'limit', type: 'number', desc: 'Max results, default 20.' },
            ]}
          />
          <CodeBlock lang="bash">{`curl "https://api.nova.ng/api/v1/facilities/search?q=teaching+hospital"`}</CodeBlock>
        </Endpoint>

        <Endpoint id="facilities-stats" method="GET" path="/api/v1/facilities/stats" title="Facility statistics">
          <p>Aggregated counts by state, type, ownership, and verification status. Useful for dashboards and coverage maps.</p>
          <CodeBlock lang="bash">{`curl https://api.nova.ng/api/v1/facilities/stats`}</CodeBlock>
        </Endpoint>

        <Endpoint id="facilities-contribute" method="POST" path="/api/v1/facilities/contributions" title="Submit a facility">
          <p>Open submission endpoint. Contributions enter a moderation queue and are reviewed by admins before going live. No auth required.</p>
          <CodeBlock>{`{
  "name": "Example Clinic",
  "facilityType": "clinic",
  "ownership": "private",
  "state": "lagos",
  "lga": "ikeja",
  "address": "12 Allen Avenue",
  "services": ["general", "antenatal"]
}`}</CodeBlock>
        </Endpoint>
      </section>

      {/* SCHEDULES GROUP */}
      <section className="scroll-mt-20 space-y-8 pt-2">
        <div className="border-t border-slate-200 pt-8">
          <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">API Reference</p>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Clinic Schedules</h2>
          <p className="text-sm text-slate-600 mt-2">
            Specialist clinic days, hours, and referral requirements at facilities offering
            scheduled outpatient services.
          </p>
        </div>

        <Endpoint id="schedules-list" method="GET" path="/api/v1/clinic-schedules" title="List clinic schedules">
          <p>Filter clinic schedules by facility, specialty, day of week, state, or whether a referral is required.</p>
          <ParamTable
            rows={[
              { name: 'facility_id', type: 'uuid', desc: 'Restrict to schedules at a specific facility.' },
              { name: 'specialty', type: 'string', desc: 'e.g. "cardiology", "paediatrics".' },
              { name: 'day', type: 'enum', desc: 'monday, tuesday, …, sunday' },
              { name: 'state', type: 'string', desc: 'State slug.' },
              { name: 'referral_required', type: 'boolean', desc: 'Whether a referral is needed.' },
            ]}
          />
          <CodeBlock lang="bash">{`curl "https://api.nova.ng/api/v1/clinic-schedules?specialty=cardiology&day=monday"`}</CodeBlock>
        </Endpoint>

        <Endpoint id="schedules-get" method="GET" path="/api/v1/clinic-schedules/:id" title="Get a clinic schedule">
          <p>Fetch a single schedule entry with the full facility relation expanded.</p>
        </Endpoint>

        <Endpoint id="schedules-search" method="GET" path="/api/v1/clinic-schedules/search" title="Search clinic schedules">
          <p>Search schedules by specialty name with optional state and day filters.</p>
        </Endpoint>

        <Endpoint id="schedules-contribute" method="POST" path="/api/v1/clinic-schedules/contributions" title="Submit a clinic schedule">
          <p>Submit a new clinic schedule for review. Like facility submissions, no auth required and entries are moderated.</p>
        </Endpoint>
      </section>

      {/* METADATA GROUP */}
      <section className="scroll-mt-20 space-y-8 pt-2">
        <div className="border-t border-slate-200 pt-8">
          <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">API Reference</p>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Metadata</h2>
          <p className="text-sm text-slate-600 mt-2">
            Reference data for building filter dropdowns, type-aheads, and coverage views.
          </p>
        </div>

        <Endpoint id="meta-states" method="GET" path="/api/v1/states" title="List all Nigerian states">
          <p>Returns all 36 states plus the FCT, each with slug, name, and ISO code.</p>
        </Endpoint>

        <Endpoint id="meta-lgas" method="GET" path="/api/v1/states/:state/lgas" title="List LGAs by state">
          <p>Returns LGAs (Local Government Areas) for the given state slug.</p>
          <CodeBlock lang="bash">{`curl https://api.nova.ng/api/v1/states/lagos/lgas`}</CodeBlock>
        </Endpoint>

        <Endpoint id="meta-services" method="GET" path="/api/v1/services" title="List facility services">
          <p>Canonical list of services offered across facilities — useful for the <code className="bg-slate-100 px-1 rounded text-xs">service</code> filter on facilities.</p>
        </Endpoint>

        <Endpoint id="meta-specialties" method="GET" path="/api/v1/specialties" title="List medical specialties">
          <p>Specialties available on clinic schedules.</p>
        </Endpoint>

        <Endpoint id="meta-stats" method="GET" path="/api/v1/stats" title="Global statistics">
          <p>Platform-wide totals — facility count, schedule count, contributions in review, coverage by state.</p>
        </Endpoint>

        <Endpoint id="meta-health" method="GET" path="/api/v1/health" title="Health check">
          <p>Returns a simple liveness response. Use this for monitoring and uptime checks.</p>
          <CodeBlock>{`{ "success": true, "data": { "status": "ok" } }`}</CodeBlock>
        </Endpoint>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 pt-8 text-xs text-slate-500 flex items-center justify-between">
        <span>NOVA · Nigerian Open Verified Access</span>
        <a
          href="https://github.com/nova-ng/nova"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-900"
        >
          Edit on GitHub →
        </a>
      </footer>
    </article>
  );
}

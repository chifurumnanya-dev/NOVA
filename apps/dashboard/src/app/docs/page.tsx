import { ExternalLink } from 'lucide-react';
import { API_BASE_V1_URL as API_BASE_V1 } from '@/lib/config';

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
    <pre className={`bg-slate-900 ${accent} text-[11px] sm:text-xs px-3 sm:px-4 py-3.5 rounded-xl overflow-x-auto font-mono leading-relaxed border border-slate-800`}>
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
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">{title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2.5">
          <MethodBadge method={method} />
          <code className="text-xs sm:text-sm font-mono text-slate-700 break-all">{path}</code>
        </div>
      </div>
      <div className="space-y-3 text-sm text-slate-600 leading-relaxed">{children}</div>
    </section>
  );
}

function ParamTable({ rows }: { rows: { name: string; type: string; desc: string }[] }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-x-auto">
      <table className="w-full min-w-[36rem] text-xs">
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
      "verificationStatus": "source_verified"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 51000,
    "total_pages": 2550,
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
    <article className="space-y-10 sm:space-y-14">
      {/* HERO */}
      <header className="border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-mono font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">v1</span>
          <span className="text-[11px] font-mono text-slate-400">stable</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">NOVA API</h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
          Public REST API for Nigerian healthcare data. Read facilities, clinic schedules, and
          metadata across all 36 states and the FCT — no key required.
        </p>
        <div className="mt-5 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <a href={`${API_BASE_V1}/health`} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs py-1.5">
            <ExternalLink size={12} /> Try live API
          </a>
          <a href="#quick-start" className="btn-primary text-xs py-1.5">Quick start →</a>
        </div>
      </header>

      {/* OVERVIEW */}
      <section id="overview" className="scroll-mt-20 space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Overview</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          NOVA provides free, structured access to healthcare facility data across Nigeria.
          All read operations are public and unauthenticated. Contributions (new facilities,
          edit suggestions, clinic schedules) are also open and enter a moderation queue
          before going live.
        </p>
        <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
          <li>RESTful conventions, JSON request and response bodies</li>
          <li>Versioned under <code className="bg-slate-100 px-1 rounded text-xs">/api/v1</code></li>
          <li>Stable response envelope: <code className="bg-slate-100 px-1 rounded text-xs">{`{ success, data, meta }`}</code></li>
          <li>Page-based pagination via <code className="bg-slate-100 px-1 rounded text-xs">page</code> &amp; <code className="bg-slate-100 px-1 rounded text-xs">limit</code></li>
          <li>Permissive CORS — call directly from browser apps</li>
        </ul>
      </section>

      {/* BASE URL */}
      <section id="base-url" className="scroll-mt-20 space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Base URL</h2>
        <p className="text-sm text-slate-600">All endpoints are served from a single base URL.</p>
        <CodeBlock lang="bash">{API_BASE_V1}</CodeBlock>
      </section>

      {/* AUTHENTICATION */}
      <section id="authentication" className="scroll-mt-20 space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Authentication</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          All read endpoints and contribution submissions are open — no credentials required.
          Admin moderation endpoints (the contributions queue) are gated by a private
          <code className="bg-slate-100 px-1 rounded text-xs"> X-Admin-Secret</code> header
          and are not part of the public API surface.
        </p>
      </section>

      {/* RATE LIMITS */}
      <section id="rate-limits" className="scroll-mt-20 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Rate Limits</h2>
        <p className="text-sm text-slate-600">
          Requests are rate-limited per client IP. Every response includes rate-limit headers
          so you can track your remaining budget.
        </p>
        <div className="border border-slate-200 rounded-xl p-4 max-w-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Anonymous (default)</p>
          <p className="text-base font-bold text-slate-900 mt-1">100 requests / hour / IP</p>
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
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Quick Start</h2>
        <p className="text-sm text-slate-600">
          The fastest way to get started: list facilities with a state filter.
        </p>
        <CodeBlock lang="bash">{`curl "${API_BASE_V1}/facilities?state=Lagos&limit=5"`}</CodeBlock>
        <p className="text-sm text-slate-600">
          See <a href="#facilities-list" className="text-green-700 hover:underline">List facilities</a> for
          full filtering, or <a href="#response-format" className="text-green-700 hover:underline">Response Format</a> for the envelope shape.
        </p>
      </section>

      {/* RESPONSE FORMAT */}
      <section id="response-format" className="scroll-mt-20 space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Response Format</h2>
        <p className="text-sm text-slate-600">
          All successful responses share a stable envelope. List endpoints include pagination metadata
          under <code className="bg-slate-100 px-1 rounded text-xs">meta</code>.
        </p>
        <CodeBlock>{SUCCESS_EXAMPLE}</CodeBlock>
      </section>

      {/* ERRORS */}
      <section id="errors" className="scroll-mt-20 space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Errors</h2>
        <p className="text-sm text-slate-600">
          Errors return a non-2xx status with a structured body. The <code className="bg-slate-100 px-1 rounded text-xs">code</code> field
          is stable and safe to branch on.
        </p>
        <CodeBlock lang="error">{ERROR_EXAMPLE}</CodeBlock>
        <ParamTable
          rows={[
            { name: 'VALIDATION_ERROR', type: '400', desc: 'Query or body failed schema validation.' },
            { name: 'NOT_FOUND', type: '404', desc: 'The requested resource does not exist.' },
            { name: 'FORBIDDEN', type: '403', desc: 'Missing or invalid admin credentials on a protected route.' },
            { name: 'RATE_LIMIT_EXCEEDED', type: '429', desc: 'You exceeded the rate limit. Retry after the reset window.' },
            { name: 'INTERNAL_ERROR', type: '500', desc: 'Unexpected server error. Safe to retry.' },
          ]}
        />
      </section>

      {/* ENUMS */}
      <section id="enums" className="scroll-mt-20 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Enums</h2>
        <p className="text-sm text-slate-600">
          Stable enum values used across the API. Pass these as filter values on list endpoints.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">facility_type</h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                'teaching_hospital', 'federal_medical_centre', 'general_hospital',
                'primary_health_centre', 'private_hospital', 'mission_hospital',
                'specialist_hospital', 'diagnostic_centre', 'laboratory', 'pharmacy',
                'maternity_centre', 'dialysis_centre', 'emergency_centre',
              ].map((v) => (
                <code key={v} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-mono">{v}</code>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">ownership</h3>
            <div className="flex flex-wrap gap-1.5">
              {['public', 'private', 'mission', 'ngo', 'military'].map((v) => (
                <code key={v} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-mono">{v}</code>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">level</h3>
            <div className="flex flex-wrap gap-1.5">
              {['tertiary', 'secondary', 'primary'].map((v) => (
                <code key={v} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-mono">{v}</code>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">verificationStatus</h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                'unverified', 'community_submitted', 'source_verified',
                'admin_verified', 'stale', 'rejected',
              ].map((v) => (
                <code key={v} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-mono">{v}</code>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">day (clinic schedules)</h3>
            <div className="flex flex-wrap gap-1.5">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((v) => (
                <code key={v} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-mono">{v}</code>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FACILITIES GROUP */}
      <section className="scroll-mt-20 space-y-8 pt-2">
        <div className="border-t border-slate-200 pt-8">
          <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider">API Reference</p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">Facilities</h2>
          <p className="text-sm text-slate-600 mt-2">
            Health facilities — hospitals, clinics, primary health centres — with location,
            ownership, services and verification status.
          </p>
        </div>

        <Endpoint id="facilities-list" method="GET" path="/api/v1/facilities" title="List facilities">
          <p>Returns a paginated list of facilities. Filter by state, LGA, type, level, ownership, service, verification status, or free-text query.</p>
          <ParamTable
            rows={[
              { name: 'q', type: 'string', desc: 'Free-text search across facility name and metadata.' },
              { name: 'state', type: 'string', desc: 'State name, e.g. "Lagos", "FCT".' },
              { name: 'lga', type: 'string', desc: 'LGA name within the chosen state.' },
              { name: 'facility_type', type: 'enum', desc: 'See facility_type enum above.' },
              { name: 'level', type: 'enum', desc: 'tertiary, secondary, or primary — coarse-grain bucket.' },
              { name: 'ownership', type: 'enum', desc: 'public, private, mission, ngo, military.' },
              { name: 'service', type: 'string', desc: 'Filter facilities offering this service slug.' },
              { name: 'verified', type: 'boolean', desc: '"true" to return only verified facilities.' },
              { name: 'page', type: 'number', desc: 'Page number, default 1.' },
              { name: 'limit', type: 'number', desc: 'Page size, default 20, max 500.' },
            ]}
          />
          <CodeBlock lang="bash">{`curl "${API_BASE_V1}/facilities?state=Lagos&level=tertiary&page=1"`}</CodeBlock>
        </Endpoint>

        <Endpoint id="facilities-search" method="GET" path="/api/v1/facilities/search" title="Search facilities">
          <p>Alias of <code className="bg-slate-100 px-1 rounded text-xs">GET /facilities</code> with the same query parameters. Provided for semantic clarity in client code.</p>
          <CodeBlock lang="bash">{`curl "${API_BASE_V1}/facilities/search?q=teaching+hospital"`}</CodeBlock>
        </Endpoint>

        <Endpoint id="facilities-stats" method="GET" path="/api/v1/facilities/stats" title="Facility statistics">
          <p>Aggregated counts: total, verified, by state, and by type. Useful for dashboards and coverage maps.</p>
          <CodeBlock lang="bash">{`curl ${API_BASE_V1}/facilities/stats`}</CodeBlock>
        </Endpoint>

        <Endpoint id="facilities-get" method="GET" path="/api/v1/facilities/:id" title="Get a facility">
          <p>Fetch a single facility by its UUID. Returns the full record including services, contact details, clinic schedules, and metadata provenance.</p>
          <CodeBlock lang="bash">{`curl ${API_BASE_V1}/facilities/9c7d2a1f-…`}</CodeBlock>
        </Endpoint>

        <Endpoint id="facilities-contribute" method="POST" path="/api/v1/facilities/contributions" title="Submit a new facility">
          <p>Open submission endpoint. Contributions enter a moderation queue and are reviewed by admins before going live. No auth required.</p>
          <CodeBlock>{`{
  "name": "Example Clinic",
  "facilityType": "private_hospital",
  "ownership": "private",
  "state": "Lagos",
  "lga": "Ikeja",
  "address": "12 Allen Avenue",
  "phone": "+2348012345678"
}`}</CodeBlock>
        </Endpoint>

        <Endpoint id="facilities-suggest-edit" method="POST" path="/api/v1/facilities/:id/suggest-edit" title="Suggest an edit to a facility">
          <p>Submit corrections or additions for an existing facility. Like new submissions, suggestions enter the moderation queue. No auth required.</p>
          <CodeBlock>{`{
  "field": "phone",
  "value": "+2348098765432",
  "reason": "Old number is disconnected; verified new number 2026-04-01"
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
              { name: 'specialty', type: 'string', desc: 'Specialty slug, e.g. "cardiology", "paediatrics".' },
              { name: 'day', type: 'enum', desc: 'monday, tuesday, …, sunday' },
              { name: 'state', type: 'string', desc: 'State name.' },
              { name: 'referral_required', type: 'boolean', desc: '"true" or "false" — whether a referral is needed.' },
              { name: 'page', type: 'number', desc: 'Page number, default 1.' },
              { name: 'limit', type: 'number', desc: 'Page size, default 20, max 500.' },
            ]}
          />
          <CodeBlock lang="bash">{`curl "${API_BASE_V1}/clinic-schedules?specialty=cardiology&day=monday"`}</CodeBlock>
        </Endpoint>

        <Endpoint id="schedules-search" method="GET" path="/api/v1/clinic-schedules/search" title="Search clinic schedules">
          <p>Alias of the list endpoint with the same parameters.</p>
        </Endpoint>

        <Endpoint id="schedules-get" method="GET" path="/api/v1/clinic-schedules/:id" title="Get a clinic schedule">
          <p>Fetch a single schedule entry with the full facility relation expanded.</p>
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
          <p>Returns all 36 states plus the FCT, each with id, name, and code.</p>
          <CodeBlock lang="bash">{`curl ${API_BASE_V1}/states`}</CodeBlock>
        </Endpoint>

        <Endpoint id="meta-lgas" method="GET" path="/api/v1/states/:state/lgas" title="List LGAs by state">
          <p>Returns LGAs (Local Government Areas) for the given state. The <code className="bg-slate-100 px-1 rounded text-xs">:state</code> path parameter accepts the state name.</p>
          <CodeBlock lang="bash">{`curl ${API_BASE_V1}/states/Lagos/lgas`}</CodeBlock>
        </Endpoint>

        <Endpoint id="meta-services" method="GET" path="/api/v1/services" title="List facility services">
          <p>Canonical list of services offered across facilities — useful for the <code className="bg-slate-100 px-1 rounded text-xs">service</code> filter on facilities.</p>
        </Endpoint>

        <Endpoint id="meta-specialties" method="GET" path="/api/v1/specialties" title="List medical specialties">
          <p>Specialties available on clinic schedules.</p>
        </Endpoint>

        <Endpoint id="meta-stats" method="GET" path="/api/v1/stats" title="Global statistics">
          <p>Platform-wide totals — facility count, schedule count, states &amp; LGAs covered, verified count.</p>
          <CodeBlock lang="bash">{`curl ${API_BASE_V1}/stats`}</CodeBlock>
        </Endpoint>

        <Endpoint id="meta-health" method="GET" path="/api/v1/health" title="Health check">
          <p>Returns a simple liveness response. Use this for monitoring and uptime checks.</p>
          <a
            href={`${API_BASE_V1}/health`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800"
          >
            <ExternalLink size={14} /> Open health endpoint
          </a>
          <CodeBlock>{`{ "success": true, "data": { "status": "ok" } }`}</CodeBlock>
        </Endpoint>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 pt-8 text-xs text-slate-500 flex items-center justify-between">
        <span>NOVA · Nigerian Open Verified Access</span>
        <a
          href={API_BASE_V1}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-900"
        >
          API root →
        </a>
      </footer>
    </article>
  );
}

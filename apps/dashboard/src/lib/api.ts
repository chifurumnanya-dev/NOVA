const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

class ApiError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    throw new ApiError(
      json.error?.code ?? 'UNKNOWN',
      json.error?.message ?? 'An error occurred',
    );
  }

  return json;
}

// ─── Facilities ───────────────────────────────────────────────────────────────

export interface Facility {
  id: string;
  name: string;
  facilityType: string;
  ownership: string;
  state: { id: string; name: string };
  lga: { id: string; name: string } | null;
  ward: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  openingHours: string | null;
  latitude: number | null;
  longitude: number | null;
  verificationStatus: string;
  confidenceScore: number;
  lastVerifiedAt: string | null;
  dataSource: string | null;
  facilityServices: { service: { id: string; name: string; slug: string } }[];
  clinicSchedules?: ClinicSchedule[];
  externalId: string | null;
  externalCode: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface FacilityFilters {
  state?: string;
  lga?: string;
  facility_type?: string;
  level?: 'tertiary' | 'secondary' | 'primary';
  ownership?: string;
  service?: string;
  verified?: 'true' | 'false';
  q?: string;
  page?: number;
  limit?: number;
}

export interface FacilityStats {
  total: number;
  verified: number;
  by_state: { state: string; count: number }[];
  by_type: { type: string; count: number }[];
}

export const facilitiesApi = {
  list: (filters: FacilityFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v !== undefined && params.set(k, String(v)));
    return apiFetch<Facility[]>(`/facilities?${params}`);
  },

  getById: (id: string) => apiFetch<Facility>(`/facilities/${id}`),

  search: (filters: FacilityFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v !== undefined && params.set(k, String(v)));
    return apiFetch<Facility[]>(`/facilities/search?${params}`);
  },

  stats: () => apiFetch<FacilityStats>('/facilities/stats'),
  update: (id: string, payload: Partial<Facility>) =>
    apiFetch<Facility>(`/facilities/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
};

// ─── Clinic Schedules ─────────────────────────────────────────────────────────

export interface ClinicSchedule {
  id: string;
  facilityId: string;
  clinicName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  referralRequired: boolean;
  appointmentProcess: string | null;
  notes: string | null;
  verificationStatus: string;
  facility?: Pick<Facility, 'id' | 'name' | 'state'>;
  specialty: { id: string; name: string; slug: string } | null;
  createdAt: string;
}

export interface ClinicFilters {
  state?: string;
  facility_id?: string;
  specialty?: string;
  day?: string;
  referral_required?: 'true' | 'false';
  page?: number;
  limit?: number;
}

export const clinicSchedulesApi = {
  list: (filters: ClinicFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v !== undefined && params.set(k, String(v)));
    return apiFetch<ClinicSchedule[]>(`/clinic-schedules?${params}`);
  },

  getById: (id: string) => apiFetch<ClinicSchedule>(`/clinic-schedules/${id}`),
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export interface GlobalStats {
  total_facilities: number;
  total_clinic_schedules: number;
  states_covered: number;
  lgas_covered: number;
  verified_facilities: number;
}

export interface State {
  id: string;
  name: string;
  code: string;
}

export const metaApi = {
  stats: () => apiFetch<GlobalStats>('/stats'),
  states: () => apiFetch<State[]>('/states'),
  services: () => apiFetch<{ id: string; name: string; slug: string }[]>('/services'),
  specialties: () => apiFetch<{ id: string; name: string; slug: string }[]>('/specialties'),
};

// ─── Contributions ────────────────────────────────────────────────────────────

export const contributionsApi = {
  submitFacility: (payload: unknown) =>
    apiFetch('/facilities/contributions', { method: 'POST', body: JSON.stringify(payload) }),

  submitClinicSchedule: (payload: unknown) =>
    apiFetch('/clinic-schedules/contributions', { method: 'POST', body: JSON.stringify(payload) }),

  suggestFacilityEdit: (id: string, payload: unknown) =>
    apiFetch(`/facilities/${id}/suggest-edit`, { method: 'POST', body: JSON.stringify(payload) }),
};

export { ApiError };

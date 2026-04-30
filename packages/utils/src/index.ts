// ─── Response Utilities ────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta | Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function successResponse<T>(data: T, meta?: PaginationMeta | Record<string, unknown>): ApiSuccess<T> {
  return { success: true, data, ...(meta ? { meta } : {}) };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): ApiSuccess<T[]> {
  const total_pages = Math.ceil(total / limit);
  return {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      total_pages,
      has_next_page: page < total_pages,
    },
  };
}

export function errorResponse(
  message: string,
  code: string = 'INTERNAL_ERROR',
  details?: unknown,
): ApiError {
  return {
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
  };
}

// ─── Pagination Parameter Parsing ─────────────────────────────────────────────

export function getPaginationParams(searchParams: URLSearchParams): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const rawLimit = parseInt(searchParams.get('limit') ?? '20', 10) || 20;
  const limit = Math.min(100, Math.max(1, rawLimit));
  return { page, limit, offset: (page - 1) * limit };
}

// ─── HTTP Status Codes ────────────────────────────────────────────────────────

export const HTTP = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
} as const;

// ─── Nigerian States Reference Data ──────────────────────────────────────────

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun',
  'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara',
] as const;

export const FACILITY_SERVICES = [
  'Emergency care', 'Maternity care', 'Antenatal care', 'Immunisation',
  'Paediatrics', 'Surgery', 'Internal medicine', 'Cardiology', 'Dialysis',
  'Laboratory services', 'Radiology', 'Mental health', 'HIV services',
  'TB services', 'Family planning', 'Dental care', 'Eye care',
] as const;

export const SPECIALTIES = [
  'Cardiology', 'Paediatrics', 'Obstetrics and Gynaecology', 'Surgery',
  'Orthopaedics', 'Ophthalmology', 'ENT', 'Dermatology', 'Psychiatry',
  'Neurology', 'Nephrology', 'Oncology', 'Haematology', 'Endocrinology',
  'Gastroenterology', 'Urology', 'Dental surgery', 'Family medicine',
] as const;

const LOCAL_API_BASE_URL = 'http://localhost:8787';
const PRODUCTION_API_BASE_URL = 'https://nova-api.nova-ng.workers.dev';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === 'production' ? PRODUCTION_API_BASE_URL : LOCAL_API_BASE_URL);

export const API_BASE_V1_URL = `${API_BASE_URL}/api/v1`;

export const BUILD_FETCH_TIMEOUT_MS = 8_000;

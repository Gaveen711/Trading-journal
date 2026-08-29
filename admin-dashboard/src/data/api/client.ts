import { getAuth } from 'firebase/auth';
import type { Paginated, PaginationParams } from '../../domain/models';
import { assertMutationReason } from '../../domain/models';
import { AdminApiContractError, record, string } from './runtime';

const PRODUCTION_ADMIN_API_BASE_URL = 'https://www.xaujournal.com/api/admin';
const DEFAULT_ADMIN_API_TIMEOUT_MS = 15_000;

type AccessTokenProvider = () => Promise<string | null>;
type Decoder<T> = (value: unknown, path?: string) => T;
type QueryValue = string | number | boolean | null | undefined;

const environment = import.meta.env as Record<string, string | boolean | undefined>;
const configuredBaseUrl = typeof environment.VITE_ADMIN_API_BASE_URL === 'string'
  ? environment.VITE_ADMIN_API_BASE_URL.trim()
  : '';
const localDevBaseUrl = typeof environment.VITE_ADMIN_DEV_API_BASE_URL === 'string'
  ? environment.VITE_ADMIN_DEV_API_BASE_URL.trim()
  : '';
const configuredTimeoutMs = typeof environment.VITE_ADMIN_API_TIMEOUT_MS === 'string'
  ? Number(environment.VITE_ADMIN_API_TIMEOUT_MS)
  : Number.NaN;

export const ADMIN_API_BASE_URL = (
  environment.DEV === true
    ? (localDevBaseUrl || '/api/admin')
    : (configuredBaseUrl || PRODUCTION_ADMIN_API_BASE_URL)
).replace(/\/+$/, '');

export const ADMIN_API_TIMEOUT_MS = Number.isFinite(configuredTimeoutMs)
  && configuredTimeoutMs >= 1_000
  && configuredTimeoutMs <= 60_000
  ? configuredTimeoutMs
  : DEFAULT_ADMIN_API_TIMEOUT_MS;

export type AdminApiErrorCategory =
  | 'network'
  | 'session'
  | 'authorization'
  | 'not_found'
  | 'validation'
  | 'rate_limit'
  | 'backend'
  | 'unknown';

export interface AdminApiErrorOptions {
  status?: number;
  code?: string;
  category?: AdminApiErrorCategory;
  requestId?: string;
  retryable?: boolean;
  causeData?: unknown;
}

let accessTokenProvider: AccessTokenProvider = async () => {
  let currentUser;
  try {
    currentUser = getAuth().currentUser;
  } catch {
    throw new AdminApiError('Firebase Auth has not been initialized.', {
      status: 401,
      code: 'auth_not_initialized',
      category: 'session',
    });
  }
  if (!currentUser) {
    throw new AdminApiError('An authenticated administrator is required.', {
      status: 401,
      code: 'admin_session_required',
      category: 'session',
    });
  }
  return currentUser.getIdToken();
};

export class AdminApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly category: AdminApiErrorCategory;
  readonly requestId?: string;
  readonly retryable: boolean;
  readonly causeData?: unknown;

  constructor(message: string, options: AdminApiErrorOptions = {}) {
    super(message);
    this.name = 'AdminApiError';
    this.status = options.status ?? 0;
    this.code = options.code ?? defaultErrorCode(this.status);
    this.category = options.category ?? categoryForStatus(this.status);
    this.requestId = options.requestId;
    this.retryable = options.retryable ?? isRetryable(this.category, this.status);
    this.causeData = options.causeData;
  }
}

export function isAdminApiError(value: unknown): value is AdminApiError {
  return value instanceof AdminApiError;
}

export function errorCategory(value: unknown): AdminApiErrorCategory {
  return isAdminApiError(value) ? value.category : 'unknown';
}

function categoryForStatus(status: number): AdminApiErrorCategory {
  if (status === 401) return 'session';
  if (status === 403) return 'authorization';
  if (status === 404) return 'not_found';
  if (status === 429) return 'rate_limit';
  if (status >= 400 && status < 500) return 'validation';
  if (status >= 500) return 'backend';
  return 'unknown';
}

function defaultErrorCode(status: number): string {
  if (status > 0) return `http_${status}`;
  return 'admin_api_error';
}

function isRetryable(category: AdminApiErrorCategory, status: number): boolean {
  return category === 'network' || category === 'rate_limit' || (category === 'backend' && status >= 500);
}

export function configureAdminAccessTokenProvider(provider: AccessTokenProvider): () => void {
  const previous = accessTokenProvider;
  accessTokenProvider = provider;
  return () => { accessTokenProvider = previous; };
}

export function buildAdminQuery(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  const value = search.toString();
  return value ? `?${value}` : '';
}

interface AdminRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  headers?: HeadersInit;
  timeoutMs?: number;
}

interface AdminTransportResult {
  payload: unknown;
  requestId?: string;
}

export interface AdminResponse<T> {
  data: T;
  nextPageToken?: string;
  requestId?: string;
}

function errorRecord(payload: unknown): Record<string, unknown> | undefined {
  try {
    const envelope = record(payload, 'error response');
    return typeof envelope.error === 'object' && envelope.error !== null && !Array.isArray(envelope.error)
      ? record(envelope.error, 'error response.error')
      : undefined;
  } catch {
    return undefined;
  }
}

function safeString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function safeRequestId(value: unknown): string | undefined {
  const candidate = safeString(value);
  return candidate && /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/.test(candidate)
    ? candidate
    : undefined;
}

function serverCategory(value: unknown): AdminApiErrorCategory | undefined {
  const allowed: AdminApiErrorCategory[] = [
    'session', 'authorization', 'not_found', 'validation', 'rate_limit', 'backend',
  ];
  return typeof value === 'string' && allowed.includes(value as AdminApiErrorCategory)
    ? value as AdminApiErrorCategory
    : undefined;
}

async function readPayload(response: Response, requestId?: string): Promise<unknown> {
  if (response.status === 204) return { data: null };
  const text = await response.text();
  if (!text) return { data: null };
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new AdminApiError('The admin API returned an invalid JSON response.', {
      status: response.status,
      code: 'invalid_json_response',
      category: response.ok ? 'backend' : categoryForStatus(response.status),
      requestId,
      retryable: response.ok || response.status >= 500,
    });
  }
}

async function executeAdminRequest(
  path: string,
  { body, headers, timeoutMs = ADMIN_API_TIMEOUT_MS, signal, ...options }: AdminRequestOptions = {},
): Promise<AdminTransportResult> {
  let token: string | null;
  try {
    token = await accessTokenProvider();
  } catch (value) {
    if (isAdminApiError(value)) throw value;
    throw new AdminApiError('The administrator session could not be verified.', {
      status: 401,
      code: 'admin_session_unavailable',
      category: 'session',
      causeData: value,
    });
  }
  if (!token) {
    throw new AdminApiError('An authenticated administrator is required.', {
      status: 401,
      code: 'admin_session_required',
      category: 'session',
    });
  }

  const requestHeaders = new Headers(headers);
  requestHeaders.set('Accept', 'application/json');
  requestHeaders.set('Authorization', `Bearer ${token}`);
  if (body !== undefined) requestHeaders.set('Content-Type', 'application/json');

  const controller = new AbortController();
  let timedOut = false;
  const abortFromCaller = () => controller.abort(signal?.reason);
  if (signal?.aborted) abortFromCaller();
  else signal?.addEventListener('abort', abortFromCaller, { once: true });
  const timeout = globalThis.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, Math.max(1_000, timeoutMs));

  let response: Response;
  try {
    response = await fetch(`${ADMIN_API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      ...options,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (value) {
    if (timedOut) {
      throw new AdminApiError('The admin API request timed out.', {
        code: 'request_timeout',
        category: 'network',
        retryable: true,
        causeData: value,
      });
    }
    if (signal?.aborted) {
      throw new AdminApiError('The admin API request was cancelled.', {
        code: 'request_aborted',
        category: 'unknown',
        retryable: false,
        causeData: value,
      });
    }
    throw new AdminApiError('The admin API could not be reached.', {
      code: 'network_error',
      category: 'network',
      retryable: true,
      causeData: value,
    });
  } finally {
    globalThis.clearTimeout(timeout);
    signal?.removeEventListener('abort', abortFromCaller);
  }

  const headerRequestId = safeRequestId(response.headers.get('X-Request-Id'));
  const payload = await readPayload(response, headerRequestId);
  if (!response.ok) {
    const structured = errorRecord(payload);
    const envelope = (() => {
      try { return record(payload, 'error response'); } catch { return undefined; }
    })();
    const legacyMessage = safeString(envelope?.error);
    const message = safeString(structured?.message)
      ?? legacyMessage
      ?? `Admin API request failed with status ${response.status}.`;
    const category = serverCategory(structured?.category) ?? categoryForStatus(response.status);
    const requestId = headerRequestId ?? safeRequestId(structured?.requestId);
    throw new AdminApiError(message, {
      status: response.status,
      code: safeString(structured?.code) ?? defaultErrorCode(response.status),
      category,
      requestId,
      causeData: payload,
    });
  }
  return { payload, requestId: headerRequestId };
}

export async function adminRequest(
  path: string,
  options: AdminRequestOptions = {},
): Promise<unknown> {
  return (await executeAdminRequest(path, options)).payload;
}

export async function requestData<T>(
  path: string,
  decode: Decoder<T>,
  options?: AdminRequestOptions,
): Promise<T> {
  return (await requestDataWithMetadata(path, decode, options)).data;
}

export async function requestDataWithMetadata<T>(
  path: string,
  decode: Decoder<T>,
  options?: AdminRequestOptions,
): Promise<AdminResponse<T>> {
  const response = await executeAdminRequest(path, options);
  const envelope = record(response.payload, 'response');
  if (!Object.hasOwn(envelope, 'data')) throw new AdminApiContractError('response.data', 'a data property');
  const nextPageToken = envelope.nextPageToken === undefined
    ? undefined
    : string(envelope.nextPageToken, 'response.nextPageToken');
  return {
    data: decode(envelope.data, 'response.data'),
    ...(nextPageToken ? { nextPageToken } : {}),
    ...(response.requestId ? { requestId: response.requestId } : {}),
  };
}

export async function requestCollection<T>(
  path: string,
  decode: Decoder<T>,
  params: PaginationParams & Record<string, QueryValue> = {},
  signal?: AbortSignal,
): Promise<Paginated<T>> {
  const { pageSize, ...queryParams } = params;
  const response = await executeAdminRequest(`${path}${buildAdminQuery({
    ...queryParams,
    limit: pageSize,
  })}`, { signal });
  const envelope = record(response.payload, 'response');
  if (!Array.isArray(envelope.data)) throw new AdminApiContractError('response.data', 'an array');
  const nextPageToken = envelope.nextPageToken === undefined
    ? undefined
    : string(envelope.nextPageToken, 'response.nextPageToken');
  return {
    data: envelope.data.map((item, index) => decode(item, `response.data[${index}]`)),
    ...(nextPageToken ? { nextPageToken } : {}),
  };
}

export function reasonedBody<T extends object>(value: T, reason: string): T & { reason: string } {
  return { ...value, reason: assertMutationReason(reason) };
}

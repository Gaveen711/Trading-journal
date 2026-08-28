import { getAuth } from 'firebase/auth';
import type { Paginated, PaginationParams } from '../../domain/models';
import { assertMutationReason } from '../../domain/models';
import { AdminApiContractError, record, string } from './runtime';

const PRODUCTION_ADMIN_API_BASE_URL = 'https://www.xaujournal.com/api/admin';

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

export const ADMIN_API_BASE_URL = (
  environment.DEV === true
    ? (localDevBaseUrl || '/api/admin')
    : (configuredBaseUrl || PRODUCTION_ADMIN_API_BASE_URL)
).replace(/\/+$/, '');

let accessTokenProvider: AccessTokenProvider = async () => {
  let currentUser;
  try {
    currentUser = getAuth().currentUser;
  } catch {
    throw new AdminApiError('Firebase Auth has not been initialized.', 401);
  }
  if (!currentUser) throw new AdminApiError('An authenticated administrator is required.', 401);
  return currentUser.getIdToken();
};

export class AdminApiError extends Error {
  readonly status: number;
  readonly causeData?: unknown;

  constructor(message: string, status: number, causeData?: unknown) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
    this.causeData = causeData;
  }
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
}

async function readPayload(response: Response): Promise<unknown> {
  if (response.status === 204) return { data: null };
  const text = await response.text();
  if (!text) return { data: null };
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new AdminApiError('The admin API returned an invalid JSON response.', response.status, text);
  }
}

export async function adminRequest(
  path: string,
  { body, headers, ...options }: AdminRequestOptions = {},
): Promise<unknown> {
  const token = await accessTokenProvider();
  if (!token) throw new AdminApiError('An authenticated administrator is required.', 401);

  const requestHeaders = new Headers(headers);
  requestHeaders.set('Accept', 'application/json');
  requestHeaders.set('Authorization', `Bearer ${token}`);
  if (body !== undefined) requestHeaders.set('Content-Type', 'application/json');

  const response = await fetch(`${ADMIN_API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    ...options,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await readPayload(response);
  if (!response.ok) {
    let message = `Admin API request failed with status ${response.status}.`;
    try {
      message = string(record(payload, 'error response').error, 'error response.error');
    } catch {
      // Keep a non-sensitive status message when the server breaks its error contract.
    }
    throw new AdminApiError(message, response.status, payload);
  }
  return payload;
}

export async function requestData<T>(
  path: string,
  decode: Decoder<T>,
  options?: AdminRequestOptions,
): Promise<T> {
  const envelope = record(await adminRequest(path, options), 'response');
  if (!Object.hasOwn(envelope, 'data')) throw new AdminApiContractError('response.data', 'a data property');
  return decode(envelope.data, 'response.data');
}

export async function requestCollection<T>(
  path: string,
  decode: Decoder<T>,
  params: PaginationParams & Record<string, QueryValue> = {},
  signal?: AbortSignal,
): Promise<Paginated<T>> {
  const { pageSize, ...queryParams } = params;
  const envelope = record(await adminRequest(`${path}${buildAdminQuery({
    ...queryParams,
    limit: pageSize,
  })}`, { signal }), 'response');
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

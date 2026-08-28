export type UnknownRecord = Record<string, unknown>;

export class AdminApiContractError extends Error {
  readonly path: string;

  constructor(path: string, expectation: string) {
    super(`Invalid admin API response at ${path}: expected ${expectation}.`);
    this.name = 'AdminApiContractError';
    this.path = path;
  }
}

export function record(value: unknown, path = 'data'): UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new AdminApiContractError(path, 'an object');
  }
  return value as UnknownRecord;
}

export function string(value: unknown, path: string): string {
  if (typeof value !== 'string') throw new AdminApiContractError(path, 'a string');
  return value;
}

export function optionalString(value: unknown, path: string): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return string(value, path);
}

export function number(value: unknown, path: string): number {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
  if (!Number.isFinite(parsed)) throw new AdminApiContractError(path, 'a finite number');
  return parsed;
}

export function optionalNumber(value: unknown, path: string): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return number(value, path);
}

export function boolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') throw new AdminApiContractError(path, 'a boolean');
  return value;
}

export function optionalBoolean(value: unknown, path: string): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  return boolean(value, path);
}

export function array<T>(value: unknown, path: string, decode: (item: unknown, path: string) => T): T[] {
  if (!Array.isArray(value)) throw new AdminApiContractError(path, 'an array');
  return value.map((item, index) => decode(item, `${path}[${index}]`));
}

export function optionalArray<T>(
  value: unknown,
  path: string,
  decode: (item: unknown, path: string) => T,
): T[] {
  if (value === undefined || value === null) return [];
  return array(value, path, decode);
}

export function enumValue<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
  path: string,
  fallback?: T[number],
): T[number] {
  const normalized = typeof value === 'string' ? value.toUpperCase() : value;
  if (typeof normalized === 'string' && allowed.includes(normalized)) return normalized as T[number];
  if (fallback !== undefined && (value === undefined || value === null || value === '')) return fallback;
  throw new AdminApiContractError(path, `one of ${allowed.join(', ')}`);
}

export function dateString(value: unknown, path: string): string {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return new Date(value).toISOString();
  if (typeof value === 'object' && value !== null) {
    const source = value as UnknownRecord;
    const seconds = source.seconds ?? source._seconds;
    if (typeof seconds === 'number' && Number.isFinite(seconds)) return new Date(seconds * 1000).toISOString();
  }
  throw new AdminApiContractError(path, 'a date string or timestamp');
}

export function optionalDateString(value: unknown, path: string): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return dateString(value, path);
}

export function first(source: UnknownRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) return source[key];
  }
  return undefined;
}


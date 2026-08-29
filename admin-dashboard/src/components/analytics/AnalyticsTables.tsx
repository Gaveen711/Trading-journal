import { formatDate, formatMoney } from '../../pages/_shared';

type UnknownRecord = Record<string, unknown>;

interface SeriesField {
  key: string;
  label: string;
  format: 'number' | 'money';
}

interface SeriesRow {
  date: string;
  values: Map<string, number | null>;
}

export interface AnalyticsSeries {
  fields: SeriesField[];
  rows: SeriesRow[];
}

export interface PaymentOutcomeRow {
  status: string;
  count: number;
}

const SERIES_FIELDS: readonly SeriesField[] = [
  { key: 'newUsers', label: 'New users', format: 'number' },
  { key: 'users', label: 'Users', format: 'number' },
  { key: 'settledPayments', label: 'Settled payments', format: 'number' },
  { key: 'failedPayments', label: 'Failed payments', format: 'number' },
  { key: 'payments', label: 'Payments', format: 'number' },
  { key: 'revenue', label: 'Revenue', format: 'money' },
  { key: 'openedReports', label: 'Opened reports', format: 'number' },
  { key: 'resolvedReports', label: 'Resolved reports', format: 'number' },
  { key: 'reports', label: 'Reports', format: 'number' },
] as const;

const PAYMENT_STATUS_LABELS: Readonly<Record<string, string>> = {
  SUCCESS: 'Successful',
  SETTLED: 'Settled',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  PENDING: 'Pending',
  OTHER: 'Other',
};

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as UnknownRecord
    : null;
}

function finiteNumber(value: unknown): number | null | undefined {
  if (value === null) return null;
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function extractAnalyticsSeries(value: unknown): AnalyticsSeries | null {
  const rawSeries = asRecord(value)?.timeSeries;
  if (!Array.isArray(rawSeries)) return null;
  const fieldKeys = new Set<string>();
  const rows: SeriesRow[] = [];

  rawSeries.forEach((item) => {
    const source = asRecord(item);
    if (!source || typeof source.date !== 'string' || !source.date.trim()) return;
    const values = new Map<string, number | null>();
    SERIES_FIELDS.forEach((field) => {
      const numeric = finiteNumber(source[field.key]);
      if (numeric !== undefined) {
        values.set(field.key, numeric);
        fieldKeys.add(field.key);
      }
    });
    if (values.size > 0) rows.push({ date: source.date, values });
  });

  if (rows.length === 0 || fieldKeys.size === 0) return null;
  return { fields: SERIES_FIELDS.filter((field) => fieldKeys.has(field.key)), rows };
}

function statusLabel(value: string): string {
  const normalized = value.trim().toUpperCase();
  return PAYMENT_STATUS_LABELS[normalized] ?? normalized.replaceAll('_', ' ');
}

function combineOutcomes(rows: PaymentOutcomeRow[]): PaymentOutcomeRow[] {
  const counts = new Map<string, number>();
  rows.forEach((row) => counts.set(row.status, (counts.get(row.status) ?? 0) + row.count));
  return Array.from(counts, ([status, count]) => ({ status, count }));
}

export function extractPaymentOutcomes(value: unknown): PaymentOutcomeRow[] {
  const source = asRecord(value);
  const payments = asRecord(source?.payments);
  const rawOutcomes = payments?.outcomes ?? source?.paymentOutcomes;

  if (Array.isArray(rawOutcomes)) {
    return combineOutcomes(rawOutcomes.flatMap((item) => {
      const outcome = asRecord(item);
      const count = finiteNumber(outcome?.count);
      if (!outcome || typeof outcome.status !== 'string' || count === undefined || count === null) return [];
      return [{ status: statusLabel(outcome.status), count }];
    }));
  }

  const outcomeRecord = asRecord(rawOutcomes);
  if (!outcomeRecord) return [];
  return Object.entries(outcomeRecord).flatMap(([status, rawCount]) => {
    const count = finiteNumber(rawCount);
    return count === undefined || count === null ? [] : [{ status: statusLabel(status), count }];
  });
}

function displayValue(value: number | null | undefined, format: SeriesField['format']): string {
  if (value === undefined) return '—';
  if (value === null) return 'Unavailable';
  return format === 'money' ? formatMoney(value) : value.toLocaleString();
}

export function AnalyticsSeriesTable({ series }: { series: AnalyticsSeries }) {
  return <div className="admin-table-wrap">
    <table className="admin-table">
      <caption className="admin-sr-only">Analytics values by date</caption>
      <thead><tr>
        <th scope="col" className="admin-table__cell--start">Date</th>
        {series.fields.map((field) => <th key={field.key} scope="col" className="admin-table__cell--end">{field.label}</th>)}
      </tr></thead>
      <tbody>{series.rows.map((row, index) => <tr key={`${row.date}-${index}`}>
        <th scope="row" className="admin-table__cell--start">{formatDate(row.date)}</th>
        {series.fields.map((field) => <td key={field.key} className="admin-table__cell--end admin-table__numeric">
          {displayValue(row.values.get(field.key), field.format)}
        </td>)}
      </tr>)}</tbody>
    </table>
  </div>;
}

export function PaymentOutcomesTable({ outcomes }: { outcomes: PaymentOutcomeRow[] }) {
  const total = outcomes.reduce((sum, outcome) => sum + outcome.count, 0);
  return <div className="admin-table-wrap">
    <table className="admin-table">
      <caption className="admin-sr-only">Normalized payment outcome counts</caption>
      <thead><tr>
        <th scope="col" className="admin-table__cell--start">Outcome</th>
        <th scope="col" className="admin-table__cell--end">Count</th>
        <th scope="col" className="admin-table__cell--end">Share</th>
      </tr></thead>
      <tbody>{outcomes.map((outcome) => <tr key={outcome.status}>
        <th scope="row" className="admin-table__cell--start">{outcome.status}</th>
        <td className="admin-table__cell--end admin-table__numeric">{outcome.count.toLocaleString()}</td>
        <td className="admin-table__cell--end admin-table__numeric">
          {total > 0 ? `${(outcome.count / total * 100).toFixed(1)}%` : '—'}
        </td>
      </tr>)}</tbody>
    </table>
  </div>;
}

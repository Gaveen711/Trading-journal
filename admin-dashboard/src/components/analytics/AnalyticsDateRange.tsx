import { useEffect, useState, type FormEvent } from 'react';
import { CalendarRange, RotateCcw } from 'lucide-react';
import { Button, TextField } from '..';
import './analytics.css';

export interface AnalyticsDateRangeValue {
  from: string;
  to: string;
}

interface DateErrors {
  from?: string;
  to?: string;
}

export interface AnalyticsDateRangeProps {
  value: AnalyticsDateRangeValue;
  busy?: boolean;
  onApply: (value: AnalyticsDateRangeValue) => void;
}

function todayDateInputValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function validDateInput(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(`${value}T00:00:00Z`));
}

function validateRange(value: AnalyticsDateRangeValue, today: string): DateErrors {
  const errors: DateErrors = {};
  if (!value.from && !value.to) return errors;
  if (!value.from) errors.from = 'Choose a start date, or clear the end date for all-time analytics.';
  if (!value.to) errors.to = 'Choose an end date, or clear the start date for all-time analytics.';
  if (value.from && !validDateInput(value.from)) errors.from = 'Enter a valid start date.';
  if (value.to && !validDateInput(value.to)) errors.to = 'Enter a valid end date.';
  if (!errors.from && value.from > today) errors.from = 'The start date cannot be in the future.';
  if (!errors.to && value.to > today) errors.to = 'The end date cannot be in the future.';
  if (!errors.from && !errors.to && value.from > value.to) {
    errors.to = 'The end date must be on or after the start date.';
  }
  return errors;
}

export function formatAnalyticsRange(value: AnalyticsDateRangeValue): string {
  return value.from && value.to
    ? `${value.from} through ${value.to}, inclusive`
    : 'All available history';
}

export function AnalyticsDateRange({ value, busy = false, onApply }: AnalyticsDateRangeProps) {
  const [draft, setDraft] = useState(value);
  const [errors, setErrors] = useState<DateErrors>({});
  const today = todayDateInputValue();

  useEffect(() => setDraft(value), [value]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateRange(draft, today);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onApply(draft);
  };

  const clear = () => {
    const allTime = { from: '', to: '' };
    setDraft(allTime);
    setErrors({});
    onApply(allTime);
  };

  return (
    <form className="analytics-range" onSubmit={submit} noValidate>
      <div className="analytics-range__fields">
        <TextField
          id="analytics-from"
          type="date"
          label="From"
          max={today}
          value={draft.from}
          error={errors.from}
          leadingIcon={<CalendarRange />}
          onChange={(event) => {
            setDraft((current) => ({ ...current, from: event.target.value }));
            setErrors({});
          }}
        />
        <TextField
          id="analytics-to"
          type="date"
          label="To"
          max={today}
          value={draft.to}
          error={errors.to}
          leadingIcon={<CalendarRange />}
          onChange={(event) => {
            setDraft((current) => ({ ...current, to: event.target.value }));
            setErrors({});
          }}
        />
      </div>
      <div className="analytics-range__footer">
        <p>
          <span>Query window</span>
          <strong>{formatAnalyticsRange(value)}</strong>
        </p>
        <div className="analytics-range__actions">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy || (!draft.from && !draft.to && !value.from && !value.to)}
            leadingIcon={<RotateCcw />}
            onClick={clear}
          >
            All time
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={busy}>Apply range</Button>
        </div>
      </div>
    </form>
  );
}

import { useEffect, useState } from 'react';
import { RotateCcw, Save, ShieldCheck } from 'lucide-react';
import { Button, CheckboxField, SelectField, TextField, TextareaField } from '..';
import type { User, UserPlan, UserStatus, UserUpdate } from '../../domain/models';

interface AccessDraft {
  plan: UserPlan;
  status: UserStatus;
  planExpiry: string;
  graceUntil: string;
  graceReason: string;
  isTrial: boolean;
  mt5SyncEnabled: boolean;
}

type AccessField = keyof AccessDraft;

export interface UserAccessEditorProps {
  user: User;
  disabled: boolean;
  pending: boolean;
  onReview: (updates: UserUpdate, summary: string) => void;
}

function toLocalDateTime(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toIsoDateTime(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function initialDraft(user: User): AccessDraft {
  return {
    plan: user.plan,
    status: user.status,
    planExpiry: toLocalDateTime(user.planExpiry ?? user.subscription?.expiresAt),
    graceUntil: toLocalDateTime(user.graceUntil),
    graceReason: user.graceReason ?? '',
    isTrial: user.isTrial ?? false,
    mt5SyncEnabled: user.mt5SyncEnabled ?? false,
  };
}

export function UserAccessEditor({ user, disabled, pending, onReview }: UserAccessEditorProps) {
  const [draft, setDraft] = useState<AccessDraft>(() => initialDraft(user));
  const [dirtyFields, setDirtyFields] = useState<Set<AccessField>>(() => new Set());
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setDraft(initialDraft(user));
    setDirtyFields(new Set());
    setValidationError('');
  }, [user]);

  const updateField = <K extends AccessField>(field: K, value: AccessDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setDirtyFields((current) => new Set(current).add(field));
    setValidationError('');
  };

  const reset = () => {
    setDraft(initialDraft(user));
    setDirtyFields(new Set());
    setValidationError('');
  };

  const review = () => {
    if (dirtyFields.size === 0) return;
    if (draft.plan === 'GRACE' && dirtyFields.has('plan') && draft.graceReason.trim().length < 6) {
      setValidationError('A GRACE plan requires a clear account-level grace reason.');
      return;
    }

    const updates: UserUpdate = {};
    if (dirtyFields.has('plan')) updates.plan = draft.plan;
    if (dirtyFields.has('status')) updates.status = draft.status;
    if (dirtyFields.has('planExpiry')) updates.planExpiry = toIsoDateTime(draft.planExpiry);
    if (dirtyFields.has('graceUntil')) updates.graceUntil = toIsoDateTime(draft.graceUntil);
    if (dirtyFields.has('graceReason')) updates.graceReason = draft.graceReason.trim() || null;
    if (dirtyFields.has('isTrial')) updates.isTrial = draft.isTrial;
    if (dirtyFields.has('mt5SyncEnabled')) updates.mt5SyncEnabled = draft.mt5SyncEnabled;

    const labels: Record<AccessField, string> = {
      plan: 'plan',
      status: 'account status',
      planExpiry: 'plan expiry',
      graceUntil: 'grace deadline',
      graceReason: 'grace reason',
      isTrial: 'trial flag',
      mt5SyncEnabled: 'broker sync',
    };
    onReview(updates, [...dirtyFields].map((field) => labels[field]).join(', '));
  };

  const controlsDisabled = disabled || pending;

  return <div className="user-access-editor">
    <div className="user-access-editor__grid">
      <SelectField label="Plan" value={draft.plan} disabled={controlsDisabled} onChange={(event) => updateField('plan', event.target.value as UserPlan)} options={[{ value: 'FREE', label: 'Free' }, { value: 'PRO', label: 'Pro' }, { value: 'GRACE', label: 'Grace' }]} />
      <SelectField label="Account status" value={draft.status} disabled={controlsDisabled} onChange={(event) => updateField('status', event.target.value as UserStatus)} options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'SUSPENDED', label: 'Suspended' }]} />
      <TextField label="Plan expiry" type="datetime-local" value={draft.planExpiry} disabled={controlsDisabled} onChange={(event) => updateField('planExpiry', event.target.value)} />
      <TextField label="Grace deadline" type="datetime-local" value={draft.graceUntil} disabled={controlsDisabled} onChange={(event) => updateField('graceUntil', event.target.value)} />
      <TextareaField label="Grace reason" rows={3} value={draft.graceReason} disabled={controlsDisabled} onChange={(event) => updateField('graceReason', event.target.value)} placeholder="Customer request, billing incident, or policy reference" containerClassName="user-access-editor__wide" />
      <CheckboxField label="Trial account" hint="Controls trial-specific access only." checked={draft.isTrial} disabled={controlsDisabled} onChange={(event) => updateField('isTrial', event.target.checked)} />
      <CheckboxField label="Broker sync" hint="Allows supported broker data synchronization." checked={draft.mt5SyncEnabled} disabled={controlsDisabled} onChange={(event) => updateField('mt5SyncEnabled', event.target.checked)} />
    </div>
    {validationError && <p className="user-access-editor__error" role="alert">{validationError}</p>}
    <div className="user-access-editor__policy"><ShieldCheck size={17} aria-hidden="true" /><p><strong>Protected fields stay read-only.</strong> Email, UID, credentials, API keys, tokens, and security claims cannot be changed here. MFA or recent reauthentication for high-impact actions must be enforced by the backend.</p></div>
    <div className="user-access-editor__actions">
      <Button variant="ghost" disabled={controlsDisabled || dirtyFields.size === 0} onClick={reset} leadingIcon={<RotateCcw />}>Reset</Button>
      <Button variant="primary" disabled={controlsDisabled || dirtyFields.size === 0} onClick={review} leadingIcon={<Save />}>Review changes</Button>
    </div>
  </div>;
}

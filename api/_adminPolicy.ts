export const SETTLED_PAYMENT_STATUSES = Object.freeze([
  'success',
  'paid',
  'completed',
  'succeeded',
] as const)

const SETTLED_PAYMENT_STATUS_SET = new Set<string>(SETTLED_PAYMENT_STATUSES)

export function normalizedPaymentStatus(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function isSettledPaymentStatus(value: unknown): boolean {
  return SETTLED_PAYMENT_STATUS_SET.has(normalizedPaymentStatus(value))
}

import { isAdminApiError, type AdminApiErrorCategory } from '../../data';
import type { User } from '../../domain/models';

export interface AdminErrorDescription {
  category: AdminApiErrorCategory;
  title: string;
  message: string;
  correlationId?: string;
}

export function describeAdminError(error: unknown, subject = 'request'): AdminErrorDescription {
  const category: AdminApiErrorCategory = isAdminApiError(error)
    ? error.category
    : error instanceof TypeError
      ? 'network'
      : 'unknown';
  const correlationId = isAdminApiError(error) ? error.requestId : undefined;
  const reference = correlationId ? ` Reference: ${correlationId}.` : '';

  if (isAdminApiError(error) && error.code === 'RECENT_AUTH_REQUIRED') {
    return {
      category: 'authorization',
      title: 'Recent sign-in required',
      message: `Sign out and sign in again before retrying this ${subject}.${reference}`,
      correlationId,
    };
  }

  switch (category) {
    case 'network':
      return { category, title: 'Admin API unreachable', message: `The browser could not reach the admin API. Check the local API proxy or network connection, then retry.${reference}`, correlationId };
    case 'session':
      return { category, title: 'Admin session expired', message: `Sign in again with the authorized administrator account, then retry this ${subject}.${reference}`, correlationId };
    case 'authorization':
      return { category, title: 'Access denied', message: `The signed-in account is not permitted to perform this ${subject}. Verify the administrator role; changing the UI will not bypass the API policy.${reference}`, correlationId };
    case 'not_found':
      return { category, title: 'User not found', message: `No account exists for this canonical UID, or it was removed before the request completed.${reference}`, correlationId };
    case 'validation':
      return { category, title: 'Request rejected', message: `One or more submitted values failed server validation. Review the dates and account settings, then retry.${reference}`, correlationId };
    case 'rate_limit':
      return { category, title: 'Too many admin requests', message: `The admin API temporarily rate-limited this ${subject}. Wait briefly before retrying.${reference}`, correlationId };
    case 'backend':
      return { category, title: 'Admin service error', message: `The admin API could not complete this ${subject}. No change should be treated as confirmed until a refresh succeeds.${reference}`, correlationId };
    default:
      return { category, title: 'Unexpected admin error', message: `The ${subject} failed for an unknown reason. Retry once and use the server logs if it persists.${reference}`, correlationId };
  }
}

export function displayUserName(user: User): string {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return user.displayName?.trim() || user.name?.trim() || fullName.trim() || 'Unnamed user';
}

export function canonicalUserId(user: User): string {
  return user.uid || user.id;
}

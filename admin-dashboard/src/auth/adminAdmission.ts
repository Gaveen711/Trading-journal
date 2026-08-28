import { getIdTokenResult, type User } from 'firebase/auth';

export const ADMIN_EMAIL = 'admin@xaujournal.com';
export const ADMIN_UID = 'rbGsMM2A2EdhgKLKLf9y0dGJ7RY2';

export type AdminAdmissionFailure =
  | 'wrong-uid'
  | 'wrong-email'
  | 'email-not-verified'
  | 'admin-claim-missing';

export class AdminAdmissionError extends Error {
  readonly code: AdminAdmissionFailure;

  constructor(code: AdminAdmissionFailure) {
    super('This Firebase account does not meet the administrator admission policy.');
    this.name = 'AdminAdmissionError';
    this.code = code;
  }
}

/**
 * UX gate only. Every admin API and data rule must independently verify the ID
 * token, exact UID, exact email, email_verified flag, and admin === true custom claim.
 */
export async function verifyAdminAdmission(user: User, forceRefresh = false): Promise<void> {
  const token = await getIdTokenResult(user, forceRefresh);
  const userEmail = user.email?.trim().toLowerCase();
  const tokenEmail = typeof token.claims.email === 'string'
    ? token.claims.email.trim().toLowerCase()
    : null;

  if (user.uid !== ADMIN_UID) {
    throw new AdminAdmissionError('wrong-uid');
  }

  if (userEmail !== ADMIN_EMAIL || tokenEmail !== ADMIN_EMAIL) {
    throw new AdminAdmissionError('wrong-email');
  }

  if (!user.emailVerified || token.claims.email_verified !== true) {
    throw new AdminAdmissionError('email-not-verified');
  }

  if (token.claims.admin !== true) {
    throw new AdminAdmissionError('admin-claim-missing');
  }
}

export function admissionErrorMessage(error: unknown): string {
  if (error instanceof AdminAdmissionError && error.code === 'email-not-verified') {
    return 'Verify admin@xaujournal.com before signing in to the control room.';
  }

  if (error instanceof AdminAdmissionError) {
    return 'Access requires the designated verified administrator account and an active admin claim.';
  }

  return 'The secure session could not be verified. Sign in again.';
}

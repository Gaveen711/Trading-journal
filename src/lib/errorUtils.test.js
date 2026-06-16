import { describe, it, expect } from 'vitest';
import { getFriendlyErrorMessage } from './errorUtils';

describe('getFriendlyErrorMessage', () => {
  it('returns empty string for falsy input', () => {
    expect(getFriendlyErrorMessage(null)).toBe('');
    expect(getFriendlyErrorMessage(undefined)).toBe('');
    expect(getFriendlyErrorMessage('')).toBe('');
  });

  describe('Authentication Errors', () => {
    it('handles invalid-email error', () => {
      expect(getFriendlyErrorMessage('auth/invalid-email')).toBe('Please enter a valid email address.');
      expect(getFriendlyErrorMessage({ message: 'Firebase: Error (auth/invalid-email).' })).toBe('Please enter a valid email address.');
    });

    it('handles credentials and user-not-found errors', () => {
      const expected = 'The email or password you entered was not found. Please try again.';
      expect(getFriendlyErrorMessage('auth/user-not-found')).toBe(expected);
      expect(getFriendlyErrorMessage('auth/wrong-password')).toBe(expected);
      expect(getFriendlyErrorMessage('auth/invalid-credential')).toBe(expected);
    });

    it('handles email-already-in-use error', () => {
      expect(getFriendlyErrorMessage('auth/email-already-in-use')).toBe('This email is already registered.');
    });

    it('handles weak-password error', () => {
      expect(getFriendlyErrorMessage('auth/weak-password')).toBe('Password must be at least 6 characters.');
    });

    it('handles popup/auth flow errors', () => {
      expect(getFriendlyErrorMessage('auth/popup-closed-by-user')).toBe('Authentication was cancelled.');
      expect(getFriendlyErrorMessage('auth/popup-blocked')).toBe('Popup was blocked by your browser. Please allow popups for this site and try again.');
      expect(getFriendlyErrorMessage('auth/unauthorized-domain')).toBe('This domain is not authorized for sign-in. Please contact support.');
    });

    it('handles rate limiting error', () => {
      expect(getFriendlyErrorMessage('auth/too-many-requests')).toBe('Access temporarily locked due to many attempts. Try again later.');
    });

    it('handles missing-name error', () => {
      expect(getFriendlyErrorMessage('auth/missing-name')).toBe('First name and last name are required.');
    });

    it('handles API key configuration error', () => {
      expect(getFriendlyErrorMessage('invalid api-key config')).toBe('Authentication service configuration error. Please contact support.');
      expect(getFriendlyErrorMessage('invalid api_key config')).toBe('Authentication service configuration error. Please contact support.');
    });
  });

  describe('Database / Permission Errors', () => {
    it('handles permission-denied', () => {
      expect(getFriendlyErrorMessage('permission-denied')).toBe('You do not have permission for this action.');
    });

    it('handles network-request-failed', () => {
      expect(getFriendlyErrorMessage('network-request-failed')).toBe('Network error. Please check your connection.');
    });
  });

  describe('Fallback and Generic Cleanup', () => {
    it('extracts firebase code if present in parentheses', () => {
      expect(getFriendlyErrorMessage('Firebase: Error (auth/some-error).')).toBe('Sign-in error: auth/some-error');
    });

    it('removes "Firebase: " prefix from clean messages', () => {
      expect(getFriendlyErrorMessage('Firebase: Small custom message')).toBe('Small custom message');
    });

    it('returns generic message for long technical messages', () => {
      const longMessage = 'This is an extremely long technical message that exceeds fifty characters and contains details';
      expect(getFriendlyErrorMessage(longMessage)).toBe('An unexpected error occurred. Please try again.');
    });

    it('returns generic message for messages containing parentheses, slashes, or urls', () => {
      expect(getFriendlyErrorMessage('error/with/slashes')).toBe('An unexpected error occurred. Please try again.');
      expect(getFriendlyErrorMessage('error (with parentheses)')).toBe('An unexpected error occurred. Please try again.');
      expect(getFriendlyErrorMessage('error with http://link')).toBe('An unexpected error occurred. Please try again.');
    });

    it('returns short clean messages directly', () => {
      expect(getFriendlyErrorMessage('A short simple message')).toBe('A short simple message');
    });
  });
});

import { ALLOWED_DOMAIN } from '../config/allowedDomain';

export interface DomainValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates that the email is verified and belongs to the allowed domain.
 * Does NOT rely on Google's "hd" parameter — always checks the email string.
 */
export function validateDomain(
  email: string | null | undefined,
  emailVerified: boolean
): DomainValidationResult {
  if (!email) {
    return { valid: false, reason: 'No email address found on this account.' };
  }

  if (!emailVerified) {
    return { valid: false, reason: 'Your email address has not been verified.' };
  }

  const domain = email.split('@')[1]?.toLowerCase();

  if (domain !== ALLOWED_DOMAIN) {
    return {
      valid: false,
      reason: 'Access restricted. Please login using your official domain email.',
    };
  }

  return { valid: true };
}

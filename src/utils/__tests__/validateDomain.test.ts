import { describe, it, expect } from '@jest/globals';
import { validateDomain } from '../validateDomain';

describe('validateDomain', () => {
  it('allows valid domain with verified email', () => {
    const result = validateDomain('employee@hbplus.fit', true);
    expect(result.valid).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('allows uppercase email when domain matches case-insensitively', () => {
    const result = validateDomain('NIKHIL@HBPLUS.FIT', true);
    expect(result.valid).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('allows mixed-case email on allowed domain', () => {
    const result = validateDomain('User.Name@HbPlus.Fit', true);
    expect(result.valid).toBe(true);
  });

  it('rejects unverified email even if domain is valid', () => {
    const result = validateDomain('employee@hbplus.fit', false);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Your email address has not been verified.');
  });

  it('rejects null or undefined email', () => {
    const nullResult = validateDomain(null, true);
    expect(nullResult.valid).toBe(false);
    expect(nullResult.reason).toBe('No email address found on this account.');

    const undefinedResult = validateDomain(undefined, true);
    expect(undefinedResult.valid).toBe(false);
    expect(undefinedResult.reason).toBe('No email address found on this account.');
  });

  it('rejects lookalike domain "a@evilhbplus.fit"', () => {
    const result = validateDomain('a@evilhbplus.fit', true);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe(
      'Access restricted. Please login using your official domain email.'
    );
  });

  it('rejects lookalike domain "a@hbplus.fit.com"', () => {
    const result = validateDomain('a@hbplus.fit.com', true);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe(
      'Access restricted. Please login using your official domain email.'
    );
  });

  it('rejects unrelated domain like gmail.com (when default domain is hbplus.fit)', () => {
    const result = validateDomain('random@gmail.com', true);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe(
      'Access restricted. Please login using your official domain email.'
    );
  });
});

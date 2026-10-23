/**
 * The allowed email domain for login.
 * Configurable via EXPO_PUBLIC_ALLOWED_DOMAIN env variable.
 * Default: "hbplus.fit"
 */
export const ALLOWED_DOMAIN: string = (
  process.env.EXPO_PUBLIC_ALLOWED_DOMAIN || 'hbplus.fit'
).toLowerCase();

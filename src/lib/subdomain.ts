/** Lowercase latin, digits and hyphens — what a subdomain label allows. */
const SUBDOMAIN_PATTERN = /^[a-z0-9]([a-z0-9-]{1,28}[a-z0-9])?$/;

export function isValidSubdomain(value: string): boolean {
  return SUBDOMAIN_PATTERN.test(value);
}

/** Keeps only what a subdomain label allows, as the user types. */
export function sanitizeSubdomain(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, '');
}

/**
 * Slugifies a tenant name into a subdomain candidate. A name written in a
 * script the label cannot carry — Arabic among them — leaves nothing usable,
 * and the caller is expected to check the result before applying it.
 */
export function toSubdomainSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

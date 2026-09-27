const TENANT_DOMAIN = import.meta.env.VITE_TENANT_DOMAIN;
if (!TENANT_DOMAIN) {
  throw new Error("VITE_TENANT_DOMAIN is not defined");
}

/** The domain every tenant site lives under, e.g. "tripgate.app". */
export const tenantDomain: string = TENANT_DOMAIN;

/** e.g. "acme" -> "acme.tripgate.app" */
export function tenantHost(subdomain: string): string {
  return `${subdomain}.${tenantDomain}`;
}

/** e.g. "acme" -> "https://acme.tripgate.app" */
export function tenantUrl(subdomain: string): string {
  return `https://${tenantHost(subdomain)}`;
}

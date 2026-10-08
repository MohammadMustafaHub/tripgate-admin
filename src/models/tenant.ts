/** Colours of a tenant's client site, as hex values such as "#1E40AF". */
export interface TenantTheme {
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
  primary: string;
  onPrimary: string;
  accent: string;
  onAccent: string;
  success: string;
  danger: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  /** Public URL of the tenant's logo. */
  logoUrl: string | null;
  theme: TenantTheme;
  subscriptionType: "Free" | "Pro";
  subscriptionExpiresAt: string | null;
  hasActiveSubscription: boolean;
  createdAt: string;
}

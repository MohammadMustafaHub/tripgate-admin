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

export type Plan = "Free" | "Basic" | "Pro" | "ProAnnual";

/** Mirrors the API's numeric SubscriptionPlan, used when putting a tenant on a plan. */
export const SubscriptionPlan = {
  Free: 0,
  Basic: 1,
  Pro: 2,
  ProAnnual: 3,
} as const satisfies Record<Plan, number>;

export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

/** Limits in effect: the plan's, with any tenant-specific overrides applied. */
export interface PlanLimits {
  /** Trips that may be created per billing month. */
  maxTripsPerMonth: number;
  /** Trips that may be open for booking (active, registration not yet closed) at the same time. */
  maxActiveTrips: number;
  /** Users in the tenant, the tenant admin included. */
  maxUsers: number;
}

/** A tenant's plan limits next to what it is currently using. */
export interface TenantUsage {
  plan: Plan;
  limits: PlanLimits;
  billingPeriodStart: string;
  /** When the monthly trip count resets. */
  billingPeriodEnd: string;
  tripsThisPeriod: number;
  activeTrips: number;
  users: number;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  /** Public URL of the tenant's logo. */
  logoUrl: string | null;
  theme: TenantTheme;
  plan: Plan;
  /** Billing months begin on this day of each month. */
  subscriptionStartedAt: string | null;
  subscriptionExpiresAt: string | null;
  hasActiveSubscription: boolean;
  limits: PlanLimits;
  createdAt: string;
}

/** Limits set for one tenant in place of its plan's; null means the plan's value applies. */
export interface LimitOverrides {
  maxTripsPerMonth: number | null;
  maxActiveTrips: number | null;
  maxUsers: number | null;
}

/** A tenant as the system admin sees it: its subscription, limits and any overrides. */
export interface SystemTenant {
  id: string;
  name: string;
  subdomain: string;
  plan: Plan;
  subscriptionStartedAt: string | null;
  subscriptionExpiresAt: string | null;
  hasActiveSubscription: boolean;
  /** Limits in effect: the plan's, with the overrides applied. */
  limits: PlanLimits;
  /** Null when the tenant uses its plan's limits. */
  limitOverrides: LimitOverrides | null;
  createdAt: string;
}

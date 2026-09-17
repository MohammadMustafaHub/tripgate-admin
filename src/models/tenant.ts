import { z } from 'zod';

/** Whether the tenant is active or suspended. */
export const tenantStatuses = ['Active', 'Suspended'] as const;
export type TenantStatus = (typeof tenantStatuses)[number];
export const tenantStatusSchema = z.enum(tenantStatuses);

/** The plan the tenant is currently on. */
export const subscriptionPlans = ['Free', 'Pro'] as const;
export type SubscriptionPlan = (typeof subscriptionPlans)[number];
export const subscriptionPlanSchema = z.enum(subscriptionPlans);

/** A tenant and its current subscription. */
export interface Tenant {
  /** Identifier of the tenant. */
  id: string;
  /** Display name of the tenant. */
  name: string;
  /** Subdomain the tenant is reached under. */
  subdomain: string;
  status: TenantStatus;
  plan: SubscriptionPlan;
  /** When the tenant was created. ISO 8601. */
  joinedAt: string;
  /** When the current plan started. ISO 8601. */
  subscribedAt: string;
  /** When the current plan lapses. ISO 8601. */
  expiresAt: string;
}

export const tenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  subdomain: z.string(),
  status: tenantStatusSchema,
  plan: subscriptionPlanSchema,
  joinedAt: z.string(),
  subscribedAt: z.string(),
  expiresAt: z.string(),
});

import { formatDate, formatNumber } from "@/lib/format";
import type { Plan, TenantUsage } from "@/models/tenant";

const PLAN_LABELS: Record<Plan, string> = {
  Free: "مجانية",
  Basic: "أساسية",
  Pro: "احترافية",
  ProAnnual: "احترافية سنوية",
};

export function formatPlan(plan: Plan): string {
  return PLAN_LABELS[plan] ?? plan;
}

/** Plans in the order they are offered, with how long a period on each lasts. */
export const PLAN_OPTIONS: { plan: Plan; duration: string }[] = [
  { plan: "Free", duration: "14 يوماً" },
  { plan: "Basic", duration: "6 أشهر" },
  { plan: "Pro", duration: "6 أشهر" },
  { plan: "ProAnnual", duration: "سنة واحدة" },
];

const UPGRADE_HINT = "قم بترقية خطة الاشتراك لرفع هذا الحد.";

export function isActiveTripLimitReached(usage: TenantUsage): boolean {
  return usage.activeTrips >= usage.limits.maxActiveTrips;
}

export function activeTripLimitMessage(usage: TenantUsage): string {
  return `بلغت الحد الأقصى للرحلات المفتوحة للحجز في الوقت نفسه (${formatNumber(usage.limits.maxActiveTrips)}). أوقف رحلة أخرى أو انتظر إغلاق التسجيل فيها، أو ${UPGRADE_HINT}`;
}

/** Why a new trip cannot be created, or null when it can. New trips open for booking, so both trip limits apply. */
export function tripLimitMessage(usage: TenantUsage): string | null {
  if (usage.tripsThisPeriod >= usage.limits.maxTripsPerMonth) {
    return `بلغت الحد الأقصى للرحلات المجدولة هذا الشهر (${formatNumber(usage.limits.maxTripsPerMonth)}). يتجدد العدد في ${formatDate(usage.billingPeriodEnd)}، أو ${UPGRADE_HINT}`;
  }
  if (isActiveTripLimitReached(usage)) return activeTripLimitMessage(usage);
  return null;
}

/** Why a new user cannot be added, or null when one can. */
export function userLimitMessage(usage: TenantUsage): string | null {
  if (usage.users < usage.limits.maxUsers) return null;
  return `بلغت الحد الأقصى لعدد المستخدمين في خطتك (${formatNumber(usage.limits.maxUsers)}). أزل موظفاً آخر، أو ${UPGRADE_HINT}`;
}

import { useQuery } from "@tanstack/react-query";
import { BadgeCheckIcon, CalendarClockIcon, MapIcon, type LucideIcon } from "lucide-react";
import { listTripPrograms } from "@/api/trip-programs";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentTenant } from "@/hooks/use-current-tenant";
import type { Tenant } from "@/models/tenant";

const numberFormatter = new Intl.NumberFormat("ar-IQ-u-nu-latn");
const dateFormatter = new Intl.DateTimeFormat("ar-IQ-u-nu-latn", { dateStyle: "long" });
const DAY_MS = 24 * 60 * 60 * 1000;

export default function DashboardView() {
  const tenantQuery = useCurrentTenant();
  const programsQuery = useQuery({
    queryKey: ["trip-programs", "count"],
    queryFn: () => listTripPrograms({ page: 1, pageSize: 1 }),
  });

  const tenant = tenantQuery.data ?? null;
  const programCount = programsQuery.data?.ok ? programsQuery.data.value.pagination.totalItems : null;

  return (
    <section className="grid w-full overflow-hidden rounded-xl border divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
      <Stat
        icon={MapIcon}
        label="برامج الرحلات"
        value={programCount === null ? null : numberFormatter.format(programCount)}
        loading={programsQuery.isPending}
      />
      <Stat
        icon={CalendarClockIcon}
        label="يوماً متبقية من الاشتراك"
        value={tenant ? remainingDays(tenant) : null}
        caption={tenant?.subscriptionExpiresAt ? `ينتهي في ${dateFormatter.format(new Date(tenant.subscriptionExpiresAt))}` : undefined}
        loading={tenantQuery.isPending}
      />
      <Stat
        icon={BadgeCheckIcon}
        label="خطة الاشتراك"
        value={tenant ? (tenant.subscriptionType === "Pro" ? "احترافية" : "مجانية") : null}
        caption={tenant ? (tenant.hasActiveSubscription ? "الاشتراك فعّال" : "الاشتراك منتهٍ") : undefined}
        loading={tenantQuery.isPending}
      />
    </section>
  );
}

function remainingDays(tenant: Tenant): string {
  if (!tenant.subscriptionExpiresAt) return "—";
  const days = Math.ceil((new Date(tenant.subscriptionExpiresAt).getTime() - Date.now()) / DAY_MS);
  return numberFormatter.format(Math.max(days, 0));
}

function Stat({
  icon: Icon,
  label,
  value,
  caption,
  loading,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
  caption?: string;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      {loading ? (
        <Skeleton className="h-11 w-24" />
      ) : (
        <span className="text-4xl font-semibold tracking-tight tabular-nums md:text-5xl">{value ?? "—"}</span>
      )}
      <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </span>
      {caption && <span className="-mt-1.5 text-xs text-muted-foreground/80">{caption}</span>}
    </div>
  );
}

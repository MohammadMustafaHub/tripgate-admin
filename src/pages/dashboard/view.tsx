import { useQuery } from "@tanstack/react-query";
import { BadgeCheckIcon, CalendarClockIcon, MapIcon } from "lucide-react";
import { listTripPrograms } from "@/api/trip-programs";
import { Stat, StatBand } from "@/components/stat-band";
import { useCurrentTenant } from "@/hooks/use-current-tenant";
import { formatDate, formatNumber } from "@/lib/format";
import type { Tenant } from "@/models/tenant";

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
    <StatBand>
      <Stat
        icon={MapIcon}
        label="برامج الرحلات"
        value={programCount === null ? null : formatNumber(programCount)}
        loading={programsQuery.isPending}
      />
      <Stat
        icon={CalendarClockIcon}
        label="يوماً متبقية من الاشتراك"
        value={tenant ? remainingDays(tenant) : null}
        caption={tenant?.subscriptionExpiresAt ? `ينتهي في ${formatDate(tenant.subscriptionExpiresAt)}` : undefined}
        loading={tenantQuery.isPending}
      />
      <Stat
        icon={BadgeCheckIcon}
        label="خطة الاشتراك"
        value={tenant ? (tenant.subscriptionType === "Pro" ? "احترافية" : "مجانية") : null}
        caption={tenant ? (tenant.hasActiveSubscription ? "الاشتراك فعّال" : "الاشتراك منتهٍ") : undefined}
        loading={tenantQuery.isPending}
      />
    </StatBand>
  );
}

function remainingDays(tenant: Tenant): string {
  if (!tenant.subscriptionExpiresAt) return "—";
  const days = Math.ceil((new Date(tenant.subscriptionExpiresAt).getTime() - Date.now()) / DAY_MS);
  return formatNumber(Math.max(days, 0));
}

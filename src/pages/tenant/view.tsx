import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheckIcon, CalendarClockIcon, CalendarPlusIcon, ExternalLinkIcon, PencilIcon } from "lucide-react";
import { getCurrentTenant } from "@/api/tenants";
import { RemoteImage } from "@/components/remote-image";
import { ThemePreview } from "@/components/tenant/theme-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/hooks/use-permission";
import { formatDate } from "@/lib/format";
import { Permission } from "@/lib/permissions";
import { tenantHost, tenantUrl } from "@/lib/tenant-url";
import { THEME_COLORS, withDefaults } from "@/lib/tenant-theme";
import type { Tenant } from "@/models/tenant";

export default function TenantViewPage() {
  const { data: result, isPending, refetch } = useQuery({
    queryKey: ["tenant", "current"],
    queryFn: getCurrentTenant,
  });

  if (isPending || !result) return <ViewSkeleton />;

  if (!result.ok) {
    return (
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyTitle>تعذّر تحميل بيانات المؤسسة</EmptyTitle>
          <EmptyDescription>يرجى التحقق من اتصالك ثم إعادة المحاولة.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button variant="outline" onClick={() => void refetch()}>
            إعادة المحاولة
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return <TenantDetails tenant={result.value} />;
}

function TenantDetails({ tenant }: { tenant: Tenant }) {
  const canManage = usePermission(Permission.ManageTenant);
  const theme = withDefaults(tenant.theme);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <RemoteImage
          src={tenant.logoUrl}
          alt={`شعار ${tenant.name}`}
          className="size-16 shrink-0 rounded-xl border bg-card object-contain p-1.5"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="truncate text-2xl font-bold">{tenant.name}</h2>
          <a
            href={tenantUrl(tenant.subdomain)}
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            className="flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-primary"
          >
            {tenantHost(tenant.subdomain)}
            <ExternalLinkIcon className="size-3.5" />
          </a>
        </div>
        {canManage && (
          <Button variant="outline" render={<Link to="/settings/tenant/edit" />} nativeButton={false}>
            <PencilIcon />
            تعديل
          </Button>
        )}
      </div>

      <dl className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
        <Detail icon={BadgeCheckIcon} label="خطة الاشتراك">
          {tenant.subscriptionType === "Pro" ? "احترافية" : "مجانية"}
          <Badge variant={tenant.hasActiveSubscription ? "secondary" : "destructive"}>
            {tenant.hasActiveSubscription ? "فعّال" : "منتهٍ"}
          </Badge>
        </Detail>
        <Detail icon={CalendarClockIcon} label="ينتهي الاشتراك في">
          {tenant.subscriptionExpiresAt ? formatDate(tenant.subscriptionExpiresAt) : "—"}
        </Detail>
        <Detail icon={CalendarPlusIcon} label="تاريخ الإنشاء">
          {formatDate(tenant.createdAt)}
        </Detail>
      </dl>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">ألوان الموقع</h3>
          <p className="text-sm text-muted-foreground">الألوان التي يظهر بها موقع مؤسستك لعملائك.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <ul className="grid content-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {THEME_COLORS.map(({ key, label, description }) => (
              <li key={key} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <span className="size-10 shrink-0 rounded-md border shadow-xs" style={{ backgroundColor: theme[key] }} />
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="truncate text-xs text-muted-foreground" title={description}>
                    {description}
                  </span>
                  <span dir="ltr" className="self-start font-mono text-xs text-muted-foreground uppercase">
                    {theme[key]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <ThemePreview theme={theme} name={tenant.name} logoUrl={tenant.logoUrl} />
        </div>
      </section>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 bg-card p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="flex items-center gap-2 text-sm font-semibold">{children}</dd>
      </div>
    </div>
  );
}

function ViewSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-xl" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

import { Link } from "react-router";
import { CalendarRangeIcon, CircleAlertIcon, PlayCircleIcon, UsersIcon, type LucideIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatNumber } from "@/lib/format";
import { formatPlan } from "@/lib/plan";
import { cn } from "@/lib/utils";
import type { TenantUsage } from "@/models/tenant";

/** The plan's three limits as meters, with when the monthly trip count resets. */
export function PlanUsage({ usage, loading }: { usage: TenantUsage | null | undefined; loading?: boolean }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">استخدام الخطة</h3>
        <p className="text-sm text-muted-foreground">
          {usage
            ? `ما استخدمته مؤسستك من حدود الخطة ${formatPlan(usage.plan)}. يتجدد عدد الرحلات الشهري في ${formatDate(usage.billingPeriodEnd)}.`
            : "ما استخدمته مؤسستك من حدود خطة الاشتراك."}
        </p>
      </div>
      {loading ? (
        <Skeleton className="h-28 w-full rounded-xl" />
      ) : !usage ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          تعذّر تحميل استخدام الخطة.
        </p>
      ) : (
        <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
          <UsageMeter
            icon={CalendarRangeIcon}
            label="الرحلات المجدولة هذا الشهر"
            used={usage.tripsThisPeriod}
            max={usage.limits.maxTripsPerMonth}
            caption={`منذ ${formatDate(usage.billingPeriodStart)}`}
          />
          <UsageMeter
            icon={PlayCircleIcon}
            label="الرحلات المفتوحة للحجز"
            used={usage.activeTrips}
            max={usage.limits.maxActiveTrips}
            caption="في الوقت نفسه"
          />
          <UsageMeter
            icon={UsersIcon}
            label="المستخدمون"
            used={usage.users}
            max={usage.limits.maxUsers}
            caption="بمن فيهم مدير المؤسسة"
          />
        </div>
      )}
    </section>
  );
}

function UsageMeter({
  icon: Icon,
  label,
  used,
  max,
  caption,
}: {
  icon: LucideIcon;
  label: string;
  used: number;
  max: number;
  caption: string;
}) {
  const ratio = max > 0 ? Math.min(used / max, 1) : 1;
  const full = used >= max;

  return (
    <div className="flex flex-col gap-3 bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Icon className="size-4" />
          {label}
        </span>
        {full && <span className="text-xs font-medium text-destructive">بلغت الحد</span>}
      </div>
      <p className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tabular-nums">{formatNumber(used)}</span>
        <span className="text-sm text-muted-foreground tabular-nums">/ {formatNumber(max)}</span>
      </p>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={used}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full transition-[width]", full ? "bg-destructive" : "bg-primary")}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{caption}</span>
    </div>
  );
}

/** Compact "used / max label" figure for list page headers; red once the limit is reached. */
export function UsageCount({ used, max, label }: { used: number; max: number; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs",
        used >= max ? "border-destructive/40 bg-destructive/5 text-destructive" : "text-muted-foreground",
      )}
    >
      <span className="font-semibold tabular-nums">
        {formatNumber(used)} / {formatNumber(max)}
      </span>
      {label}
    </span>
  );
}

/** Shown in place of a create form when the plan's limit is reached. */
export function LimitReached({ message, backTo, backLabel }: { message: string; backTo: string; backLabel: string }) {
  return (
    <Empty className="flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>بلغت حد خطة الاشتراك</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button variant="outline" render={<Link to="/settings/tenant" />} nativeButton={false}>
          عرض استخدام الخطة
        </Button>
        <Button render={<Link to={backTo} />} nativeButton={false}>
          {backLabel}
        </Button>
      </EmptyContent>
    </Empty>
  );
}

/** Explains why creating is blocked, above a list whose add button is disabled. */
export function LimitAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Alert variant="destructive" className="border-destructive/40 bg-destructive/5">
      <CircleAlertIcon />
      <AlertDescription className="text-destructive">
        {message}{" "}
        <Link to="/settings/tenant" className="font-medium underline underline-offset-4">
          عرض استخدام الخطة
        </Link>
      </AlertDescription>
    </Alert>
  );
}

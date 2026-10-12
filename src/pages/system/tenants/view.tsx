import { useState } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheckIcon,
  CalendarClockIcon,
  CalendarPlusIcon,
  CalendarRangeIcon,
  ExternalLinkIcon,
  PlayCircleIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import {
  getSystemTenant,
  updateTenantLimits,
  updateTenantSubscription,
  type UpdateSystemTenantError,
} from "@/api/system-tenants";
import { DetailItem } from "@/components/detail-item";
import { FormError, UNKNOWN_ERROR_MESSAGE } from "@/components/form/form-error";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { formatDate, formatNumber } from "@/lib/format";
import { PLAN_OPTIONS, formatPlan } from "@/lib/plan";
import { tenantHost, tenantUrl } from "@/lib/tenant-url";
import { SubscriptionPlan, type LimitOverrides, type Plan, type PlanLimits, type SystemTenant } from "@/models/tenant";

const ERROR_MESSAGES: Record<UpdateSystemTenantError, string> = {
  NOT_FOUND: "لم تعد هذه المؤسسة موجودة.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

type LimitKey = keyof PlanLimits;

const LIMIT_FIELDS: { key: LimitKey; label: string; description: string; icon: LucideIcon }[] = [
  {
    key: "maxTripsPerMonth",
    label: "الرحلات المجدولة شهرياً",
    description: "الرحلات التي يمكن إنشاؤها في كل شهر من أشهر الاشتراك.",
    icon: CalendarRangeIcon,
  },
  {
    key: "maxActiveTrips",
    label: "الرحلات المفتوحة للحجز",
    description: "الرحلات التي يمكن أن تكون مفتوحة للحجز في الوقت نفسه.",
    icon: PlayCircleIcon,
  },
  {
    key: "maxUsers",
    label: "المستخدمون",
    description: "مستخدمو المؤسسة، بمن فيهم مدير المؤسسة.",
    icon: UsersIcon,
  },
];

export default function SystemTenantViewPage() {
  const { id = "" } = useParams();
  const { data: result, isPending, refetch } = useQuery({
    queryKey: ["system-tenants", "detail", id],
    queryFn: () => getSystemTenant({ id }),
  });

  if (isPending || !result) return <ViewSkeleton />;

  if (!result.ok) {
    const notFound = result.error === "NOT_FOUND";
    return (
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyTitle>{notFound ? "المؤسسة غير موجودة" : "تعذّر تحميل المؤسسة"}</EmptyTitle>
          <EmptyDescription>
            {notFound ? "ربما حُذفت هذه المؤسسة أو أن الرابط غير صحيح." : "يرجى التحقق من اتصالك ثم إعادة المحاولة."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          {!notFound && (
            <Button variant="outline" onClick={() => void refetch()}>
              إعادة المحاولة
            </Button>
          )}
          <Button variant={notFound ? "default" : "ghost"} render={<Link to="/tenants" />} nativeButton={false}>
            العودة إلى المؤسسات
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  // Keyed so the forms start from the saved values again after each update.
  return <TenantDetails key={`${result.value.plan}-${result.value.subscriptionExpiresAt}`} tenant={result.value} />;
}

/** Keeps the cached tenant in step with what an update returned. */
function useTenantUpdated() {
  const queryClient = useQueryClient();
  return (tenant: SystemTenant) => {
    queryClient.setQueryData(["system-tenants", "detail", tenant.id], { ok: true, value: tenant });
    void queryClient.invalidateQueries({ queryKey: ["system-tenants", "list"] });
  };
}

function TenantDetails({ tenant }: { tenant: SystemTenant }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
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

      <dl className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 xl:grid-cols-4">
        <DetailItem icon={BadgeCheckIcon} label="خطة الاشتراك">
          {formatPlan(tenant.plan)}
          <Badge variant={tenant.hasActiveSubscription ? "secondary" : "destructive"}>
            {tenant.hasActiveSubscription ? "فعّال" : "منتهٍ"}
          </Badge>
        </DetailItem>
        <DetailItem icon={CalendarPlusIcon} label="بدأ الاشتراك في">
          {tenant.subscriptionStartedAt ? formatDate(tenant.subscriptionStartedAt) : "—"}
        </DetailItem>
        <DetailItem icon={CalendarClockIcon} label="ينتهي الاشتراك في">
          {tenant.subscriptionExpiresAt ? formatDate(tenant.subscriptionExpiresAt) : "—"}
        </DetailItem>
        <DetailItem icon={CalendarPlusIcon} label="تاريخ إنشاء المؤسسة">
          {formatDate(tenant.createdAt)}
        </DetailItem>
      </dl>

      <SubscriptionSection tenant={tenant} />
      <LimitsSection key={JSON.stringify(tenant.limitOverrides)} tenant={tenant} />
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function SubscriptionSection({ tenant }: { tenant: SystemTenant }) {
  const onUpdated = useTenantUpdated();
  const [plan, setPlan] = useState<Plan>(tenant.plan);
  const [confirming, setConfirming] = useState(false);

  const mutation = useMutation({
    mutationFn: updateTenantSubscription,
    onSuccess: (result) => {
      setConfirming(false);
      if (!result.ok) return;
      onUpdated(result.value);
      toast.add({ type: "success", title: "تم تحديث خطة الاشتراك." });
    },
  });

  // The current plan, while still active, is extended from its expiry; any other plan starts a new period today.
  const extendsCurrent = plan === tenant.plan && tenant.hasActiveSubscription;
  const duration = PLAN_OPTIONS.find((option) => option.plan === plan)?.duration;
  const effect = extendsCurrent
    ? `سيُمدَّد الاشتراك الحالي ${duration} بدءاً من تاريخ انتهائه${tenant.subscriptionExpiresAt ? ` (${formatDate(tenant.subscriptionExpiresAt)})` : ""}.`
    : `ستبدأ فترة اشتراك جديدة مدتها ${duration} اعتباراً من اليوم، ويبدأ معها شهر الفوترة من جديد.`;

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading title="خطة الاشتراك" description="ضع المؤسسة على خطة، أو مدّد خطتها الحالية." />
      <FormError message={mutation.data?.when(() => null, (error) => ERROR_MESSAGES[error])} />
      <div className="flex max-w-2xl flex-col gap-3 rounded-xl border bg-card p-4">
        <Field>
          <FieldLabel htmlFor="plan">الخطة</FieldLabel>
          <div className="flex flex-wrap gap-2">
            <NativeSelect
              id="plan"
              className="min-w-56 flex-1"
              value={plan}
              onChange={(e) => setPlan(e.target.value as Plan)}
            >
              {PLAN_OPTIONS.map((option) => (
                <NativeSelectOption key={option.plan} value={option.plan}>
                  {formatPlan(option.plan)} ({option.duration})
                  {option.plan === tenant.plan ? " · الحالية" : ""}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <Button onClick={() => setConfirming(true)}>{extendsCurrent ? "تمديد الاشتراك" : "تغيير الخطة"}</Button>
          </div>
          <FieldDescription>{effect}</FieldDescription>
        </Field>
      </div>

      <AlertDialog open={confirming} onOpenChange={(open) => !open && !mutation.isPending && setConfirming(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {extendsCurrent ? "تمديد الاشتراك؟" : `نقل المؤسسة إلى الخطة ${formatPlan(plan)}؟`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tenant.name}: {effect}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>تراجع</AlertDialogCancel>
            <Button
              disabled={mutation.isPending}
              onClick={() => mutation.mutate({ id: tenant.id, plan: SubscriptionPlan[plan] })}
            >
              {mutation.isPending && <Spinner />}
              تأكيد
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

type LimitValues = Record<LimitKey, string>;

const toValues = (overrides: LimitOverrides | null): LimitValues => ({
  maxTripsPerMonth: overrides?.maxTripsPerMonth?.toString() ?? "",
  maxActiveTrips: overrides?.maxActiveTrips?.toString() ?? "",
  maxUsers: overrides?.maxUsers?.toString() ?? "",
});

const toOverride = (value: string) => (value === "" ? null : Number(value));

function LimitsSection({ tenant }: { tenant: SystemTenant }) {
  const onUpdated = useTenantUpdated();
  const [values, setValues] = useState<LimitValues>(() => toValues(tenant.limitOverrides));
  const [errors, setErrors] = useState<Partial<Record<LimitKey, string>>>({});

  const mutation = useMutation({
    mutationFn: updateTenantLimits,
    onSuccess: (result) => {
      if (!result.ok) return;
      onUpdated(result.value);
      toast.add({ type: "success", title: "تم حفظ حدود المؤسسة." });
    },
  });

  const hasOverrides = !!tenant.limitOverrides;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<LimitKey, string>> = {};
    for (const { key } of LIMIT_FIELDS) {
      if (values[key] !== "" && !Number.isSafeInteger(Number(values[key]))) next[key] = "أدخل عدداً صحيحاً.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    mutation.mutate({
      id: tenant.id,
      maxTripsPerMonth: toOverride(values.maxTripsPerMonth),
      maxActiveTrips: toOverride(values.maxActiveTrips),
      maxUsers: toOverride(values.maxUsers),
    });
  };

  const reset = () =>
    mutation.mutate({ id: tenant.id, maxTripsPerMonth: null, maxActiveTrips: null, maxUsers: null });

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        title="حدود المؤسسة"
        description="الحدود المطبّقة حالياً. اضبط قيمة لتحلّ محل حد الخطة لهذه المؤسسة فقط، أو اترك الحقل فارغاً لاستخدام حد الخطة."
      />
      <FormError message={mutation.data?.when(() => null, (error) => ERROR_MESSAGES[error])} />
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
          {LIMIT_FIELDS.map(({ key, label, description, icon: Icon }) => {
            const overridden = tenant.limitOverrides?.[key] != null;
            return (
              <Field key={key} data-invalid={!!errors[key]} className="gap-2 bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <FieldLabel htmlFor={key} className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon className="size-4" />
                    {label}
                  </FieldLabel>
                  {overridden && <Badge variant="outline">مخصص</Badge>}
                </div>
                <p className="text-sm">
                  الحد الحالي:{" "}
                  <span className="text-xl font-semibold tabular-nums">{formatNumber(tenant.limits[key])}</span>
                </p>
                <Input
                  id={key}
                  dir="ltr"
                  inputMode="numeric"
                  value={values[key]}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value.replace(/\D/g, "") }))}
                  aria-invalid={!!errors[key]}
                  placeholder={overridden ? "حد الخطة" : String(tenant.limits[key])}
                  className="bg-card text-end"
                />
                <FieldDescription>{description}</FieldDescription>
                <FieldError>{errors[key]}</FieldError>
              </Field>
            );
          })}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {hasOverrides && (
            <Button type="button" variant="ghost" disabled={mutation.isPending} onClick={reset}>
              العودة إلى حدود الخطة
            </Button>
          )}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Spinner />}
            حفظ الحدود
          </Button>
        </div>
      </form>
    </section>
  );
}

function ViewSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-1/3" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-28 w-full max-w-2xl rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

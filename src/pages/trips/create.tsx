import { useNavigate, useSearchParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTrip, type CreateTripError } from "@/api/trips";
import { UNKNOWN_ERROR_MESSAGE } from "@/components/form/form-error";
import { LimitReached } from "@/components/tenant/plan-usage";
import { TripForm } from "@/components/trips/trip-form";
import { toast } from "@/components/ui/toast";
import { TENANT_USAGE_KEY, useTenantUsage } from "@/hooks/use-tenant-usage";
import { tripLimitMessage } from "@/lib/plan";

const ERROR_MESSAGES: Record<CreateTripError, string> = {
  PROGRAM_NOT_FOUND: "البرنامج المختار لم يعد موجوداً. يرجى اختيار برنامج آخر.",
  LIMIT_REACHED: "بلغت حد خطة الاشتراك للرحلات المجدولة هذا الشهر أو للرحلات المفتوحة للحجز.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

export default function TripCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const programId = searchParams.get("program") ?? undefined;
  const { data: usage } = useTenantUsage();

  const mutation = useMutation({
    mutationFn: createTrip,
    onSuccess: (result) => {
      if (!result.ok) {
        if (result.error === "LIMIT_REACHED") void queryClient.invalidateQueries({ queryKey: TENANT_USAGE_KEY });
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ["trips"] });
      void queryClient.invalidateQueries({ queryKey: TENANT_USAGE_KEY });
      toast.add({ type: "success", title: "تمت جدولة الرحلة بنجاح." });
      navigate(`/trips/${result.value.id}`, { replace: true });
    },
  });

  const cancelTo = programId ? `/trip-programs/${programId}` : "/trips";
  // Keep the form up after a failed submit so its error stays visible.
  const limitMessage = usage && !mutation.data ? tripLimitMessage(usage) : null;
  if (limitMessage) return <LimitReached message={limitMessage} backTo={cancelTo} backLabel="العودة" />;

  return (
    <TripForm
      initialProgramId={programId}
      submitLabel="جدولة الرحلة"
      cancelTo={cancelTo}
      pending={mutation.isPending}
      error={mutation.data?.when(() => null, (error) => ERROR_MESSAGES[error])}
      onSubmit={(values) => mutation.mutate(values)}
    />
  );
}

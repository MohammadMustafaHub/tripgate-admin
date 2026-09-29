import { useNavigate, useSearchParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTrip, type CreateTripError } from "@/api/trips";
import { UNKNOWN_ERROR_MESSAGE } from "@/components/form/form-error";
import { TripForm } from "@/components/trips/trip-form";
import { toast } from "@/components/ui/toast";

const ERROR_MESSAGES: Record<CreateTripError, string> = {
  PROGRAM_NOT_FOUND: "البرنامج المختار لم يعد موجوداً. يرجى اختيار برنامج آخر.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

export default function TripCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const programId = searchParams.get("program") ?? undefined;

  const mutation = useMutation({
    mutationFn: createTrip,
    onSuccess: (result) => {
      if (!result.ok) return;
      void queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.add({ type: "success", title: "تمت جدولة الرحلة بنجاح." });
      navigate(`/trips/${result.value.id}`, { replace: true });
    },
  });

  return (
    <TripForm
      initialProgramId={programId}
      submitLabel="جدولة الرحلة"
      cancelTo={programId ? `/trip-programs/${programId}` : "/trips"}
      pending={mutation.isPending}
      error={mutation.data?.when(() => null, (error) => ERROR_MESSAGES[error])}
      onSubmit={(values) => mutation.mutate(values)}
    />
  );
}

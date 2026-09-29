import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTripProgram, type CreateTripProgramError } from "@/api/trip-programs";
import { UNKNOWN_ERROR_MESSAGE } from "@/components/form/form-error";
import { TripProgramForm } from "@/components/trip-programs/trip-program-form";
import { toast } from "@/components/ui/toast";

const ERROR_MESSAGES: Record<CreateTripProgramError, string> = {
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

export default function TripProgramCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTripProgram,
    onSuccess: (result) => {
      if (!result.ok) return;
      void queryClient.invalidateQueries({ queryKey: ["trip-programs"] });
      toast.add({ type: "success", title: "تم إنشاء البرنامج بنجاح." });
      navigate(`/trip-programs/${result.value.id}`, { replace: true });
    },
  });

  return (
    <TripProgramForm
      submitLabel="إنشاء البرنامج"
      cancelTo="/trip-programs"
      pending={mutation.isPending}
      error={mutation.data?.when(() => null, (error) => ERROR_MESSAGES[error])}
      onSubmit={(values) => mutation.mutate(values)}
    />
  );
}

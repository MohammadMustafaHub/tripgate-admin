import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTripProgram, updateTripProgram, type UpdateTripProgramError } from "@/api/trip-programs";
import { UNKNOWN_ERROR_MESSAGE } from "@/components/form/form-error";
import { TripProgramForm } from "@/components/trip-programs/trip-program-form";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";

const ERROR_MESSAGES: Record<UpdateTripProgramError, string> = {
  NOT_FOUND: "لم يعد هذا البرنامج موجوداً، ربما حُذف.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

export default function TripProgramEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: result, isPending, refetch } = useQuery({
    queryKey: ["trip-programs", "detail", id],
    queryFn: () => getTripProgram({ id }),
  });

  const mutation = useMutation({
    mutationFn: updateTripProgram,
    onSuccess: (updated) => {
      if (!updated.ok) return;
      void queryClient.invalidateQueries({ queryKey: ["trip-programs"] });
      toast.add({ type: "success", title: "تم حفظ التعديلات بنجاح." });
      navigate(`/trip-programs/${id}`, { replace: true });
    },
  });

  if (isPending || !result) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="aspect-video w-full max-w-2xl" />
      </div>
    );
  }

  if (!result.ok) {
    const notFound = result.error === "NOT_FOUND";
    return (
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyTitle>{notFound ? "البرنامج غير موجود" : "تعذّر تحميل البرنامج"}</EmptyTitle>
          <EmptyDescription>
            {notFound ? "ربما حُذف هذا البرنامج أو أن الرابط غير صحيح." : "يرجى التحقق من اتصالك ثم إعادة المحاولة."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          {!notFound && (
            <Button variant="outline" onClick={() => void refetch()}>
              إعادة المحاولة
            </Button>
          )}
          <Button variant={notFound ? "default" : "ghost"} render={<Link to="/trip-programs" />} nativeButton={false}>
            العودة إلى البرامج
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <TripProgramForm
      program={result.value}
      submitLabel="حفظ التعديلات"
      cancelTo={`/trip-programs/${id}`}
      pending={mutation.isPending}
      error={mutation.data?.when(() => null, (error) => ERROR_MESSAGES[error])}
      onSubmit={(values) => mutation.mutate({ id, ...values })}
    />
  );
}

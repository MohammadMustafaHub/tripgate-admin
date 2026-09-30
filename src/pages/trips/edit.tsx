import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTrip, updateTrip, type UpdateTripError } from "@/api/trips";
import { UNKNOWN_ERROR_MESSAGE } from "@/components/form/form-error";
import { TripForm } from "@/components/trips/trip-form";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";

const ERROR_MESSAGES: Record<UpdateTripError, string> = {
  NOT_FOUND: "لم تعد هذه الرحلة موجودة، ربما حُذفت.",
  CONFLICT:
    "تعذّر الحفظ: إما أن عدد المقاعد أقل من المقاعد المحجوزة حالياً، أو أن الرحلة عُدّلت أثناء الحفظ. حدّث الصفحة وحاول مجدداً.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

export default function TripEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: result, isPending, refetch } = useQuery({
    queryKey: ["trips", "detail", id],
    queryFn: () => getTrip({ id }),
  });

  const mutation = useMutation({
    mutationFn: updateTrip,
    onSuccess: (updated) => {
      if (!updated.ok) return;
      void queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.add({ type: "success", title: "تم حفظ التعديلات بنجاح." });
      navigate(`/trips/${id}`, { replace: true });
    },
  });

  if (isPending || !result) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-24 w-full max-w-2xl rounded-xl" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  if (!result.ok) {
    const notFound = result.error === "NOT_FOUND";
    return (
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyTitle>{notFound ? "الرحلة غير موجودة" : "تعذّر تحميل الرحلة"}</EmptyTitle>
          <EmptyDescription>
            {notFound ? "ربما حُذفت هذه الرحلة أو أن الرابط غير صحيح." : "يرجى التحقق من اتصالك ثم إعادة المحاولة."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          {!notFound && (
            <Button variant="outline" onClick={() => void refetch()}>
              إعادة المحاولة
            </Button>
          )}
          <Button variant={notFound ? "default" : "ghost"} render={<Link to="/trips" />} nativeButton={false}>
            العودة إلى الرحلات
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <TripForm
      trip={result.value}
      submitLabel="حفظ التعديلات"
      cancelTo={`/trips/${id}`}
      pending={mutation.isPending}
      error={mutation.data?.when(() => null, (error) => ERROR_MESSAGES[error])}
      // Price and seats are required when editing, so the form never leaves them null here.
      onSubmit={({ takeoffDate, finalRegistrationDate, pricePerSeat, seats }) =>
        mutation.mutate({ id, takeoffDate, finalRegistrationDate, pricePerSeat: pricePerSeat!, seats: seats! })
      }
    />
  );
}

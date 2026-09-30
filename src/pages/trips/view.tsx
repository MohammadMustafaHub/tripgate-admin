import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpLeftIcon,
  CalendarClockIcon,
  ClockIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  Trash2Icon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { getTripProgram } from "@/api/trip-programs";
import {
  activateTrip,
  deactivateTrip,
  deleteTrip,
  getTrip,
  type DeleteTripError,
  type SetTripActiveError,
} from "@/api/trips";
import { UNKNOWN_ERROR_MESSAGE } from "@/components/form/form-error";
import { RemoteImage } from "@/components/remote-image";
import { StatTile, StatTiles } from "@/components/stat-tile";
import { TripBookings } from "@/components/trips/trip-bookings";
import { TripStatus } from "@/components/trips/trip-status";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { dateParts, formatNumber, formatPrice, formatShortDate } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import type { TripDetails } from "@/models/trip";

const DELETE_ERRORS: Record<DeleteTripError, string> = {
  NOT_FOUND: "لم تعد هذه الرحلة موجودة.",
  CONFLICT: "تعذّر الحذف: للرحلة حجوزات (يمكنك إيقافها بدلاً من ذلك)، أو أنها عُدّلت أثناء الحذف.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

const ACTIVE_ERRORS: Record<SetTripActiveError, string> = {
  NOT_FOUND: "لم تعد هذه الرحلة موجودة.",
  TRIP_CHANGED: "عُدّلت الرحلة أثناء التحديث. حدّث الصفحة وحاول مجدداً.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

export default function TripViewPage() {
  const { id = "" } = useParams();
  const { data: result, isPending, refetch } = useQuery({
    queryKey: ["trips", "detail", id],
    queryFn: () => getTrip({ id }),
  });

  if (isPending || !result) return <ViewSkeleton />;

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

  return <TripDetailsView trip={result.value} />;
}

function TripDetailsView({ trip }: { trip: TripDetails }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const programQuery = useQuery({
    queryKey: ["trip-programs", "detail", trip.tripProgramId],
    queryFn: () => getTripProgram({ id: trip.tripProgramId }),
  });
  const program = programQuery.data?.ok ? programQuery.data.value : null;

  const toggleActive = useMutation({
    mutationFn: trip.isActive ? deactivateTrip : activateTrip,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.add({ type: "error", title: ACTIVE_ERRORS[result.error] });
        if (result.error === "TRIP_CHANGED") void queryClient.invalidateQueries({ queryKey: ["trips"] });
        return;
      }
      // The response has no bookings, so refetch the details rather than caching it.
      void queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.add({ type: "success", title: result.value.isActive ? "تم تفعيل الرحلة." : "تم إيقاف الرحلة." });
    },
  });

  const remove = useMutation({
    mutationFn: deleteTrip,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.add({ type: "error", title: DELETE_ERRORS[result.error] });
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.add({ type: "success", title: "تم حذف الرحلة." });
      navigate("/trips", { replace: true });
    },
  });

  const takeoff = dateParts(trip.takeoffDate);
  const closes = dateParts(trip.finalRegistrationDate);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="min-w-0 flex-1 text-2xl font-bold">{trip.tripProgramName}</h2>
        <Button
          variant="link"
          className="px-2"
          render={<Link to={`/trip-programs/${trip.tripProgramId}`} />}
          nativeButton={false}
        >
          عرض البرنامج
          <ArrowUpLeftIcon />
        </Button>
        <Button
          variant="outline"
          disabled={toggleActive.isPending}
          onClick={() => toggleActive.mutate({ id: trip.id })}
        >
          {toggleActive.isPending ? <Spinner /> : trip.isActive ? <PauseIcon /> : <PlayIcon />}
          {trip.isActive ? "إيقاف الرحلة" : "تفعيل الرحلة"}
        </Button>
        <Button variant="outline" render={<Link to={`/trips/${trip.id}/edit`} />} nativeButton={false}>
          <PencilIcon />
          تعديل
        </Button>
        <AlertDialog>
          <AlertDialogTrigger
            render={<Button variant="ghost" size="icon" aria-label="حذف الرحلة" className="text-destructive hover:text-destructive" />}
          >
            <Trash2Icon />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>حذف الرحلة؟</AlertDialogTitle>
              <AlertDialogDescription>
                ستُحذف رحلة {formatShortDate(trip.takeoffDate)} نهائياً. لا يمكن حذف رحلة عليها حجوزات؛ يمكنك
                إيقافها بدلاً من ذلك.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <Button
                variant="destructive"
                disabled={remove.isPending}
                onClick={() => remove.mutate({ id: trip.id })}
              >
                {remove.isPending && <Spinner />}
                حذف
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="relative">
          {programQuery.isPending ? (
            <Skeleton className="aspect-[4/3] w-full rounded-xl lg:aspect-auto lg:h-full" />
          ) : (
            <RemoteImage
              src={imageUrl(program?.coverImage)}
              alt={trip.tripProgramName}
              className="aspect-[4/3] w-full rounded-xl border lg:aspect-auto lg:h-full"
            />
          )}
          <TripStatus trip={trip} className="absolute top-3 start-3 h-7 rounded-md text-sm shadow-sm" />
        </div>
        <StatTiles>
          <StatTile
            icon={CalendarClockIcon}
            label="موعد الانطلاق"
            value={`${takeoff.day} ${takeoff.month}`}
            caption={`${takeoff.weekday}، ${takeoff.time}`}
          />
          <StatTile
            icon={ClockIcon}
            label="آخر موعد للتسجيل"
            value={`${closes.day} ${closes.month}`}
            caption={`${closes.weekday}، ${closes.time}`}
          />
          <StatTile icon={WalletIcon} label="سعر المقعد" value={formatPrice(trip.pricePerSeat)} />
          <StatTile
            icon={UsersIcon}
            label="المقاعد المتاحة"
            value={formatNumber(trip.availableSeats)}
            caption={`من أصل ${formatNumber(trip.seats)}`}
          />
        </StatTiles>
      </div>

      <TripBookings trip={trip} />
    </div>
  );
}

function ViewSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-9 w-56" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="aspect-[4/3] w-full rounded-xl lg:aspect-auto lg:h-full" />
        <Skeleton className="aspect-square w-full rounded-xl" />
      </div>
    </div>
  );
}

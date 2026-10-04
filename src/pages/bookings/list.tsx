import { Link, useSearchParams } from "react-router";
import { useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpLeftIcon, UserPlusIcon } from "lucide-react";
import { listAllBookings, listBookings } from "@/api/bookings";
import { listTrips } from "@/api/trips";
import { ListPagination } from "@/components/list-pagination";
import { SegmentedTabs } from "@/components/segmented-tabs";
import { AddBookingDialog } from "@/components/trips/add-booking-dialog";
import { BookingsTable } from "@/components/trips/bookings-table";
import { CancelBookingDialog } from "@/components/trips/cancel-booking-dialog";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useBookingActions } from "@/hooks/use-booking-actions";
import { usePermission } from "@/hooks/use-permission";
import { formatNumber, formatShortDate } from "@/lib/format";
import { Permission } from "@/lib/permissions";
import { BookingStatus } from "@/models/booking";

const PAGE_SIZE = 20;
// Enough for a picker; the API caps page size at 100.
const TRIP_OPTIONS_LIMIT = 100;

const STATUS_FILTERS = [
  { value: "pending", label: "قيد الانتظار" },
  { value: "confirmed", label: "المؤكدة" },
  { value: "cancelled", label: "الملغاة" },
  { value: "all", label: "الكل" },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

// Pending bookings are the ones waiting on the admin, so they are shown first.
const DEFAULT_FILTER: StatusFilter = "pending";

const FILTER_STATUS: Record<StatusFilter, BookingStatus | undefined> = {
  pending: BookingStatus.Pending,
  confirmed: BookingStatus.Confirmed,
  cancelled: BookingStatus.Cancelled,
  all: undefined,
};

const COUNT_LABELS: Record<StatusFilter, string> = {
  pending: "حجوزات قيد الانتظار",
  confirmed: "حجوزات مؤكدة",
  cancelled: "حجوزات ملغاة",
  all: "إجمالي الحجوزات",
};

const EMPTY_MESSAGES: Record<StatusFilter, string> = {
  pending: "لا توجد حجوزات قيد الانتظار.",
  confirmed: "لا توجد حجوزات مؤكدة.",
  cancelled: "لا توجد حجوزات ملغاة.",
  all: "لا توجد حجوزات بعد.",
};

export default function BookingsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = (STATUS_FILTERS.find((f) => f.value === searchParams.get("status"))?.value ??
    DEFAULT_FILTER) as StatusFilter;
  const tripId = searchParams.get("trip") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const tripsQuery = useQuery({
    queryKey: ["trips", "options", "active"],
    queryFn: () => listTrips({ page: 1, pageSize: TRIP_OPTIONS_LIMIT, isActive: true }),
  });
  const trips = tripsQuery.data?.ok ? tripsQuery.data.value.data : [];
  const selectedTrip = trips.find((trip) => trip.id === tripId);
  // Only trips that can still take a booking are offered in the add dialog.
  const bookableTrips = trips.filter((trip) => trip.isOpenForBooking && trip.availableSeats > 0);
  const [adding, setAdding] = useState(false);
  const queryClient = useQueryClient();

  const { data: result, isPending } = useQuery({
    queryKey: ["bookings", tripId ?? "all", { filter, page }],
    queryFn: () => {
      const params = { status: FILTER_STATUS[filter], page, pageSize: PAGE_SIZE };
      return tripId ? listBookings({ tripId, ...params }) : listAllBookings(params);
    },
    placeholderData: keepPreviousData,
  });
  const bookings = result?.ok ? result.value.data : [];
  const pagination = result?.ok ? result.value.pagination : undefined;

  const actions = useBookingActions();
  const canManage = usePermission(Permission.ManageBookings);

  /** Updates the given search params and returns to the first page. */
  const updateParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    next.delete("page");
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next);
  };

  const goToPage = (next: number) => {
    const params = new URLSearchParams(searchParams);
    if (next === 1) params.delete("page");
    else params.set("page", String(next));
    setSearchParams(params);
    document.querySelector("[data-slot=sidebar-inset]")?.scrollTo({ top: 0 });
  };

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {isPending ? (
          <Skeleton className="h-9 w-48" />
        ) : (
          <p className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums">{formatNumber(pagination?.totalItems ?? 0)}</span>
            <span className="text-sm text-muted-foreground">{COUNT_LABELS[filter]}</span>
          </p>
        )}
        <div className="flex items-center gap-2">
          {tripId && (
            <Button variant="link" className="px-2" render={<Link to={`/trips/${tripId}`} />} nativeButton={false}>
              عرض الرحلة
              <ArrowUpLeftIcon />
            </Button>
          )}
          {canManage && (
            <Button onClick={() => setAdding(true)} disabled={tripsQuery.isPending}>
              <UserPlusIcon />
              إضافة حجز
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SegmentedTabs
          label="حالة الحجز"
          options={STATUS_FILTERS}
          value={filter}
          onChange={(value) => updateParams({ status: value === DEFAULT_FILTER ? null : value })}
        />
        <NativeSelect
          aria-label="الرحلة"
          value={tripId ?? ""}
          onChange={(e) => updateParams({ trip: e.target.value || null })}
          disabled={tripsQuery.isPending}
          className="w-full sm:w-72 [&>select]:h-9 [&>select]:bg-card"
        >
          <NativeSelectOption value="">جميع الرحلات</NativeSelectOption>
          {trips.map((trip) => (
            <NativeSelectOption key={trip.id} value={trip.id}>
              {trip.tripProgramName} — {formatShortDate(trip.takeoffDate)}
            </NativeSelectOption>
          ))}
          {tripId && !selectedTrip && !tripsQuery.isPending && (
            <NativeSelectOption value={tripId}>رحلة غير فعّالة</NativeSelectOption>
          )}
        </NativeSelect>
      </div>

      {result && !result.ok ? (
        <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {result.error === "TRIP_NOT_FOUND"
            ? "لم تعد الرحلة المختارة موجودة. اختر رحلة أخرى."
            : "تعذّر تحميل الحجوزات. يرجى تحديث الصفحة والمحاولة مجدداً."}
        </p>
      ) : (
        <BookingsTable
          bookings={bookings}
          loading={isPending}
          showTrip={!tripId}
          showPassports={selectedTrip ? selectedTrip.isInternational : true}
          firstIndex={(page - 1) * PAGE_SIZE + 1}
          busyBookingId={actions.busyBookingId}
          emptyMessage={EMPTY_MESSAGES[filter]}
          onAccept={canManage ? (booking) => actions.accept(booking.tripId, booking) : undefined}
          onCancel={canManage ? (booking) => actions.requestCancel(booking.tripId, booking) : undefined}
        />
      )}

      <ListPagination page={page} pagination={pagination} onPageChange={goToPage} />

      <AddBookingDialog
        tripOptions={bookableTrips}
        initialTripId={tripId}
        open={adding}
        onOpenChange={setAdding}
        onCreated={() => {
          setAdding(false);
          void queryClient.invalidateQueries({ queryKey: ["bookings"] });
          void queryClient.invalidateQueries({ queryKey: ["trips"] });
          toast.add({ type: "success", title: "تمت إضافة الحجز." });
        }}
      />

      <CancelBookingDialog
        booking={actions.cancelling}
        pending={actions.pending}
        onConfirm={actions.confirmCancel}
        onDismiss={actions.dismissCancel}
      />
    </div>
  );
}

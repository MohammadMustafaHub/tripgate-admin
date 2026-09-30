import { useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlusIcon } from "lucide-react";
import { listBookings } from "@/api/bookings";
import { ListPagination } from "@/components/list-pagination";
import { SegmentedTabs } from "@/components/segmented-tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useBookingActions } from "@/hooks/use-booking-actions";
import { formatNumber } from "@/lib/format";
import { BookingStatus } from "@/models/booking";
import type { TripDetails } from "@/models/trip";
import { AddBookingDialog } from "./add-booking-dialog";
import { BookingsTable } from "./bookings-table";
import { CancelBookingDialog } from "./cancel-booking-dialog";
import { SeatsMeter } from "./seats-meter";

const PAGE_SIZE = 10;

const STATUS_FILTERS = [
  { value: "all", label: "الكل" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "confirmed", label: "المؤكدة" },
  { value: "cancelled", label: "الملغاة" },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

const FILTER_STATUS: Record<StatusFilter, BookingStatus | undefined> = {
  all: undefined,
  pending: BookingStatus.Pending,
  confirmed: BookingStatus.Confirmed,
  cancelled: BookingStatus.Cancelled,
};

const EMPTY_MESSAGES: Record<StatusFilter, string> = {
  all: "لا توجد حجوزات على هذه الرحلة بعد.",
  pending: "لا توجد حجوزات قيد الانتظار.",
  confirmed: "لا توجد حجوزات مؤكدة.",
  cancelled: "لا توجد حجوزات ملغاة.",
};

/** Bookings on a trip: seat usage, a filterable table, and admin actions to add, accept and cancel. */
export function TripBookings({ trip }: { trip: TripDetails }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);

  const { data: result, isPending } = useQuery({
    queryKey: ["bookings", trip.id, { filter, page }],
    queryFn: () => listBookings({ tripId: trip.id, status: FILTER_STATUS[filter], page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });
  const bookings = result?.ok ? result.value.data : [];
  const pagination = result?.ok ? result.value.pagination : undefined;

  // Bookings change the trip's seat counts, so refresh both.
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["bookings", trip.id] });
    void queryClient.invalidateQueries({ queryKey: ["trips"] });
  };

  const actions = useBookingActions();

  const pendingCount = trip.bookings.filter((b) => b.status === BookingStatus.Pending).length;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-lg font-semibold">الحجوزات</h3>
          <p className="text-sm text-muted-foreground">
            عدد الحجوزات: {formatNumber(trip.bookings.length)}
            {pendingCount > 0 && ` · قيد الانتظار: ${formatNumber(pendingCount)}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!trip.isOpenForBooking && <span className="text-sm text-muted-foreground">الرحلة مغلقة للحجز</span>}
          <Button disabled={!trip.isOpenForBooking || trip.availableSeats === 0} onClick={() => setAdding(true)}>
            <UserPlusIcon />
            إضافة حجز
          </Button>
        </div>
      </div>

      <div className="max-w-2xl">
        <SeatsMeter reserved={trip.reservedSeats} total={trip.seats} size="lg" />
      </div>

      <SegmentedTabs
        label="حالة الحجز"
        options={STATUS_FILTERS}
        value={filter}
        onChange={(value) => {
          setFilter(value);
          setPage(1);
        }}
      />

      {result && !result.ok ? (
        <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          تعذّر تحميل الحجوزات. يرجى تحديث الصفحة والمحاولة مجدداً.
        </p>
      ) : (
        <BookingsTable
          bookings={bookings}
          loading={isPending}
          showPassports={trip.isInternational}
          firstIndex={(page - 1) * PAGE_SIZE + 1}
          busyBookingId={actions.busyBookingId}
          emptyMessage={EMPTY_MESSAGES[filter]}
          onAccept={(booking) => actions.accept(trip.id, booking)}
          onCancel={(booking) => actions.requestCancel(trip.id, booking)}
        />
      )}

      <ListPagination page={page} pagination={pagination} onPageChange={setPage} />

      <AddBookingDialog
        trip={trip}
        open={adding}
        onOpenChange={setAdding}
        onCreated={() => {
          setAdding(false);
          refresh();
          toast.add({ type: "success", title: "تمت إضافة الحجز." });
        }}
      />

      <CancelBookingDialog
        booking={actions.cancelling}
        pending={actions.pending}
        onConfirm={actions.confirmCancel}
        onDismiss={actions.dismissCancel}
      />
    </section>
  );
}

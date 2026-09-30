import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBookingStatus, type UpdateBookingStatusError } from "@/api/bookings";
import { UNKNOWN_ERROR_MESSAGE } from "@/components/form/form-error";
import { toast } from "@/components/ui/toast";
import { BookingStatus, type Booking } from "@/models/booking";

const STATUS_ERRORS: Record<UpdateBookingStatusError, string> = {
  NOT_FOUND: "لم يعد هذا الحجز موجوداً.",
  INVALID_TRANSITION: "لا يمكن نقل الحجز إلى هذه الحالة، أو أن الرحلة عُدّلت أثناء التحديث.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

/**
 * Accept and cancel for the bookings of one trip. Cancelling goes through a confirmation
 * step: `requestCancel` opens it and `confirmCancel` sends the change.
 */
export function useBookingActions(tripId: string) {
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState<Booking | null>(null);

  const mutation = useMutation({
    mutationFn: updateBookingStatus,
    onSuccess: (updated, { status }) => {
      setCancelling(null);
      // Status changes move seats, so refresh every bookings list and the trips.
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["trips"] });
      if (!updated.ok) {
        toast.add({ type: "error", title: STATUS_ERRORS[updated.error] });
        return;
      }
      toast.add({
        type: "success",
        title: status === BookingStatus.Confirmed ? "تم قبول الحجز." : "تم إلغاء الحجز وتحرير مقاعده.",
      });
    },
  });

  return {
    /** Booking whose status is being changed. */
    busyBookingId: mutation.isPending ? mutation.variables.bookingId : null,
    pending: mutation.isPending,
    cancelling,
    accept: (booking: Booking) =>
      mutation.mutate({ tripId, bookingId: booking.id, status: BookingStatus.Confirmed }),
    requestCancel: (booking: Booking) => setCancelling(booking),
    confirmCancel: () =>
      cancelling && mutation.mutate({ tripId, bookingId: cancelling.id, status: BookingStatus.Cancelled }),
    dismissCancel: () => setCancelling(null),
  };
}

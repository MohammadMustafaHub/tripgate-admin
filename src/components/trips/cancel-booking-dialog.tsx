import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import type { Booking } from "@/models/booking";

/** Confirmation before cancelling a booking, since cancelling releases its seats for good. */
export function CancelBookingDialog({
  booking,
  pending,
  onConfirm,
  onDismiss,
}: {
  /** The booking to cancel; the dialog is open while this is set. */
  booking: Booking | null;
  pending: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  return (
    <AlertDialog open={!!booking} onOpenChange={(open) => !open && onDismiss()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>إلغاء الحجز؟</AlertDialogTitle>
          <AlertDialogDescription>
            سيُلغى حجز {booking?.customerName} وتُحرَّر مقاعده ({formatNumber(booking?.reservedSeats ?? 0)}). لا
            يمكن التراجع عن الإلغاء.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>تراجع</AlertDialogCancel>
          <Button variant="destructive" disabled={pending} onClick={onConfirm}>
            إلغاء الحجز
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

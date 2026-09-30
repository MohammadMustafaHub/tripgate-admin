import { cn } from "@/lib/utils";
import { BookingStatus } from "@/models/booking";

const STATUS: Record<BookingStatus, { label: string; className: string }> = {
  [BookingStatus.Pending]: { label: "قيد الانتظار", className: "bg-yellow-600" },
  [BookingStatus.Confirmed]: { label: "مؤكد", className: "bg-emerald-600" },
  [BookingStatus.Cancelled]: { label: "ملغى", className: "bg-neutral-500" },
};

/** Booking state as a solid label in the status colour, matching the trip status labels. */
export function BookingStatusLabel({ status }: { status: BookingStatus }) {
  const { label, className } = STATUS[status] ?? STATUS[BookingStatus.Pending];
  return (
    <span className={cn("inline-flex px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-white", className)}>
      {label}
    </span>
  );
}

import { hasDeparted } from "@/lib/trip";
import { cn } from "@/lib/utils";
import type { Trip } from "@/models/trip";

type TripStatus = "open" | "closed" | "departed" | "inactive";

const STATUS: Record<TripStatus, { label: string; className: string }> = {
  open: { label: "مفتوحة للحجز", className: "bg-emerald-600" },
  closed: { label: "التسجيل مغلق", className: "bg-yellow-600" },
  departed: { label: "انطلقت", className: "bg-neutral-500" },
  inactive: { label: "متوقفة", className: "bg-red-600" },
};

function getTripStatus(trip: Trip): TripStatus {
  if (!trip.isActive) return "inactive";
  if (trip.isOpenForBooking) return "open";
  return hasDeparted(trip) ? "departed" : "closed";
}

/** Trip state as a solid label in the status colour with white text; position it with `className`. */
export function TripStatus({ trip, className }: { trip: Trip; className?: string }) {
  const status = STATUS[getTripStatus(trip)];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center px-3 py-1 text-xs font-semibold text-white",
        status.className,
        className,
      )}
    >
      {status.label}
    </span>
  );
}

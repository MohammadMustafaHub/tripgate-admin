import { Link } from "react-router";
import { ClockIcon, GlobeIcon, PlaneTakeoffIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { dateParts, formatDateTime, formatPrice, formatRelativeDay } from "@/lib/format";
import { hasDeparted } from "@/lib/trip";
import type { Trip } from "@/models/trip";
import { SeatsMeter } from "./seats-meter";
import { TripStatus } from "./trip-status";

const CARD_CLASS = "relative flex h-44 overflow-hidden rounded-xl border bg-card";
const DATE_TILE_CLASS = "flex w-28 shrink-0 flex-col items-center justify-center gap-0.5 sm:w-36";

/** Horizontal card: labelled departure date with a countdown on the right (inline start), details on the left. */
export function TripCard({ trip }: { trip: Trip }) {
  const takeoff = dateParts(trip.takeoffDate);
  const departed = hasDeparted(trip);

  return (
    <Link
      to={`/trips/${trip.id}`}
      className={`${CARD_CLASS} group transition-[border-color,box-shadow] outline-none hover:border-primary/40 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50`}
    >
      <div className={`${DATE_TILE_CLASS} bg-brand-dark text-white`}>
        <span className="flex items-center gap-1 text-xs font-medium text-white/75">
          <PlaneTakeoffIcon className="size-3.5" />
          الانطلاق
        </span>
        <span className="mt-1 text-4xl leading-none font-bold tabular-nums">{takeoff.day}</span>
        <span className="text-sm font-medium">{takeoff.month}</span>
        <span className="mt-2 rounded-full bg-white/12 px-2 py-0.5 text-[11px] text-white/85">
          {departed ? "انطلقت" : formatRelativeDay(trip.takeoffDate)}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        {/* Flush in the card's top-left corner; only the inner corner is rounded. */}
        <TripStatus trip={trip} className="absolute top-0 end-0 rounded-es-lg" />
        <div className="flex items-start gap-2 pe-24">
          <h3 className="line-clamp-1 flex-1 text-base font-semibold group-hover:text-primary">
            {trip.tripProgramName}
          </h3>
                  </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ClockIcon className="size-3.5" />
          آخر موعد للتسجيل: {formatDateTime(trip.finalRegistrationDate)}
          {trip.isInternational && (
            <>
              <span aria-hidden>·</span>
              <GlobeIcon className="size-3.5" />
              دولية
            </>
          )}
        </p>
        <div className="mt-auto flex items-end gap-6">
          <div className="min-w-0 flex-1">
            <SeatsMeter reserved={trip.reservedSeats} total={trip.seats} />
          </div>
          <span className="shrink-0 text-sm font-semibold">
            {formatPrice(trip.pricePerSeat)}
            <span className="font-normal text-muted-foreground"> / للمقعد</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export function TripCardSkeleton() {
  return (
    <div className={CARD_CLASS}>
      <Skeleton className={`${DATE_TILE_CLASS} rounded-none`} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-auto flex items-end gap-6">
          <Skeleton className="h-6 flex-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

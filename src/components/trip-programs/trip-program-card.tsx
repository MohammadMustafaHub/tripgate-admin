import { Link } from "react-router";
import { BusIcon, CalendarDaysIcon, GlobeIcon, UsersIcon } from "lucide-react";
import { RemoteImage } from "@/components/remote-image";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { imageUrl } from "@/lib/images";
import { DAY_FORMS, SEAT_FORMS, formatPrice, formatTransport, pluralize } from "@/lib/format";
import type { TripProgram } from "@/models/trip-program";

const CARD_CLASS = "flex h-44 overflow-hidden rounded-xl border bg-card";

/** Horizontal card: cover image on the right (inline start), details on the left. */
export function TripProgramCard({ program }: { program: TripProgram }) {
  return (
    <Link
      to={`/trip-programs/${program.id}`}
      className={`${CARD_CLASS} group transition-[border-color,box-shadow] outline-none hover:border-primary/40 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50`}
    >
      <RemoteImage
        src={imageUrl(program.coverImage)}
        alt={program.name}
        className="h-full w-36 shrink-0 transition-transform duration-300 group-hover:scale-[1.03] sm:w-52"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2 border-s p-4">
        <div className="flex items-start gap-2">
          <h3 className="line-clamp-1 flex-1 text-base font-semibold group-hover:text-primary">{program.name}</h3>
          {program.isInternational && (
            <Badge variant="secondary" className="shrink-0">
              <GlobeIcon />
              دولي
            </Badge>
          )}
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{program.description}</p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDaysIcon className="size-3.5" />
              {pluralize(program.totalDays, DAY_FORMS)}
            </span>
            <span className="flex items-center gap-1">
              <BusIcon className="size-3.5" />
              {formatTransport(program.transportMethod)}
            </span>
            <span className="flex items-center gap-1">
              <UsersIcon className="size-3.5" />
              {pluralize(program.defaultSeats, SEAT_FORMS)}
            </span>
          </div>
          <span className="text-sm font-semibold">
            {formatPrice(program.defaultPricePerSeat)}
            <span className="font-normal text-muted-foreground"> / للمقعد</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export function TripProgramCardSkeleton() {
  return (
    <div className={CARD_CLASS}>
      <Skeleton className="h-full w-36 shrink-0 rounded-none sm:w-52" />
      <div className="flex flex-1 flex-col gap-3 border-s p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="mt-auto flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

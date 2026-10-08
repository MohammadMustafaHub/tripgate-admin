import { CheckIcon, IdCardIcon, InboxIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, formatNumber, formatShortDate } from "@/lib/format";
import { formatPhoneNumber } from "@/lib/phone";
import { hasDeparted } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { BookingStatus, type Booking } from "@/models/booking";
import { BookingStatusLabel } from "./booking-status";

const LOADING_ROWS = 3;

/**
 * Bookings in a square-cornered table. The header row is always shown; the body shows
 * placeholder rows while loading and an empty-state row when there is nothing to list.
 */
export function BookingsTable<T extends Booking & { tripName?: string; takeoffDate?: string }>({
  bookings,
  loading = false,
  showTrip = false,
  showPassports,
  firstIndex = 1,
  busyBookingId,
  emptyMessage,
  onAccept,
  onCancel,
}: {
  /** List items also carry their trip, shown in a column when `showTrip` is set. */
  bookings: T[];
  loading?: boolean;
  showTrip?: boolean;
  /** International trips carry passport data for each seat. */
  showPassports: boolean;
  /** Row number of the first booking, so numbering continues across pages. */
  firstIndex?: number;
  /** Booking whose status is being changed; its actions show a spinner. */
  busyBookingId?: string | null;
  emptyMessage: string;
  /**
   * Omit both actions to show a read-only table without the actions column. Accept is
   * withheld from bookings whose trip has already departed.
   */
  onAccept?: (booking: T) => void;
  onCancel?: (booking: T) => void;
}) {
  const showActions = !!(onAccept || onCancel);
  const columnCount = 6 + Number(showTrip) + Number(showPassports) + Number(showActions);

  return (
    <div className="overflow-hidden border">
      <Table>
        <TableHeader className="bg-muted/70">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 text-center">#</TableHead>
            {showTrip && <TableHead>الرحلة</TableHead>}
            <TableHead>العميل</TableHead>
            <TableHead>رقم الهاتف</TableHead>
            <TableHead className="text-center">المقاعد</TableHead>
            {showPassports && <TableHead>جوازات السفر</TableHead>}
            <TableHead>الحالة</TableHead>
            <TableHead>تاريخ الحجز</TableHead>
            {showActions && <TableHead className="text-end">الإجراءات</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: LOADING_ROWS }, (_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {Array.from({ length: columnCount }, (_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full max-w-28" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : bookings.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="py-12">
                <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                  <InboxIcon className="size-6" />
                  <span className="text-sm">{emptyMessage}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            bookings.map((booking, index) => {
              const cancelled = booking.status === BookingStatus.Cancelled;
              const busy = busyBookingId === booking.id;
              // A pending booking on a trip that has already left can only be cancelled.
              const departed = !!booking.takeoffDate && hasDeparted({ takeoffDate: booking.takeoffDate });
              return (
                <TableRow key={booking.id} className={cn(cancelled && "text-muted-foreground")}>
                  <TableCell className="text-center text-muted-foreground tabular-nums">
                    {formatNumber(firstIndex + index)}
                  </TableCell>
                  {showTrip && (
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{booking.tripName}</span>
                        {booking.takeoffDate && (
                          <span className="text-xs text-muted-foreground">{formatShortDate(booking.takeoffDate)}</span>
                        )}
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{booking.customerName}</TableCell>
                  <TableCell>
                    <span dir="ltr" className="tabular-nums">
                      {formatPhoneNumber(booking.phoneNumber)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{formatNumber(booking.reservedSeats)}</TableCell>
                  {showPassports && (
                    <TableCell>
                      <PassportsCell booking={booking} />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <BookingStatusLabel status={booking.status} />
                      {booking.cancelledAt && (
                        <span className="text-xs text-muted-foreground">{formatDateTime(booking.cancelledAt)}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formatDateTime(booking.createdAt)}</TableCell>
                  {showActions && (
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {busy ? (
                          <Spinner className="my-1.5 text-muted-foreground" />
                        ) : cancelled ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <>
                            {onAccept && booking.status === BookingStatus.Pending && departed && (
                              <span className="self-center text-xs text-muted-foreground">انطلقت الرحلة</span>
                            )}
                            {onAccept && booking.status === BookingStatus.Pending && !departed && (
                              <Button
                                size="sm"
                                className="rounded-none"
                                disabled={!!busyBookingId}
                                onClick={() => onAccept(booking)}
                              >
                                <CheckIcon />
                                قبول
                              </Button>
                            )}
                            {onCancel && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-none text-destructive hover:text-destructive"
                                disabled={!!busyBookingId}
                                onClick={() => onCancel(booking)}
                              >
                                <XIcon />
                                إلغاء
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function PassportsCell({ booking }: { booking: Booking }) {
  if (booking.passports.length === 0) return <span className="text-muted-foreground">—</span>;

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="sm" className="-ms-2 rounded-none" />}>
        <IdCardIcon />
        عرض ({formatNumber(booking.passports.length)})
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 gap-0 rounded-none p-0">
        <PopoverTitle className="border-b px-3 py-2 font-semibold">جوازات السفر</PopoverTitle>
        <ul className="divide-y">
          {booking.passports.map((passport, index) => (
            <li key={`${passport.number}-${index}`} className="flex items-center justify-between gap-3 px-3 py-2">
              <span className="truncate">{passport.ownerName}</span>
              <span dir="ltr" className="shrink-0 font-mono text-xs text-muted-foreground">
                {passport.number}
              </span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

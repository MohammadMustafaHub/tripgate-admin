import { CheckIcon, IdCardIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, formatNumber } from "@/lib/format";
import { formatPhoneNumber } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { BookingStatus, type Booking } from "@/models/booking";
import { BookingStatusLabel } from "./booking-status";

/** Bookings on a trip in a square-cornered table with accept / cancel actions. */
export function BookingsTable({
  bookings,
  showPassports,
  onAccept,
  onCancel,
}: {
  bookings: Booking[];
  /** International trips carry passport data for each seat. */
  showPassports: boolean;
  onAccept: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
}) {
  return (
    <div className="overflow-hidden border">
      <Table>
        <TableHeader className="bg-muted/70">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>العميل</TableHead>
            <TableHead>رقم الهاتف</TableHead>
            <TableHead className="text-center">المقاعد</TableHead>
            {showPassports && <TableHead>جوازات السفر</TableHead>}
            <TableHead>الحالة</TableHead>
            <TableHead>تاريخ الحجز</TableHead>
            <TableHead className="text-end">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking, index) => {
            const cancelled = booking.status === BookingStatus.Cancelled;
            return (
              <TableRow key={booking.id} className={cn(cancelled && "text-muted-foreground")}>
                <TableCell className="text-center text-muted-foreground tabular-nums">
                  {formatNumber(index + 1)}
                </TableCell>
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
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {booking.status === BookingStatus.Pending && (
                      <Button size="sm" className="rounded-none" onClick={() => onAccept(booking)}>
                        <CheckIcon />
                        قبول
                      </Button>
                    )}
                    {!cancelled ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-none text-destructive hover:text-destructive"
                        onClick={() => onCancel(booking)}
                      >
                        <XIcon />
                        إلغاء
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function PassportsCell({ booking }: { booking: Booking }) {
  if (booking.passports.length === 0) return <span className="text-muted-foreground">—</span>;

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="sm" className="-ms-2 rounded-none" />}
      >
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

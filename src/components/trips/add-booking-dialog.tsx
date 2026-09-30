import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createBooking, type CreateBookingError } from "@/api/bookings";
import { FormError, UNKNOWN_ERROR_MESSAGE } from "@/components/form/form-error";
import { PhoneInput } from "@/components/form/phone-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { formatNumber, formatShortDate } from "@/lib/format";
import { toApiPhoneNumber } from "@/lib/phone";
import type { Booking } from "@/models/booking";
import type { Trip } from "@/models/trip";

const NAME_MAX = 200;
const PASSPORT_NUMBER_MAX = 50;

const ERROR_MESSAGES: Record<CreateBookingError, string> = {
  INVALID_BOOKING: "بيانات الحجز غير صالحة. يرجى مراجعة الحقول والمحاولة مجدداً.",
  TRIP_NOT_FOUND: "لم تعد هذه الرحلة موجودة.",
  BOOKING_UNAVAILABLE:
    "تعذّر الحجز: الرحلة مغلقة للحجز، أو لا تتوفر مقاعد كافية، أو أنها عُدّلت أثناء الحجز.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

interface PassportValues {
  ownerName: string;
  number: string;
}

interface FormErrors {
  customerName?: string;
  phone?: string;
  seats?: string;
  passports?: Record<number, { ownerName?: string; number?: string }>;
}

/**
 * Dialog for the admin to book seats on a trip on a customer's behalf. Pass `trip` to book on a
 * known trip, or `tripOptions` to let the admin pick the trip first.
 */
export function AddBookingDialog({
  trip,
  tripOptions,
  initialTripId,
  open,
  onOpenChange,
  onCreated,
}: {
  trip?: Trip;
  /** Trips the admin can choose from when no `trip` is given. */
  tripOptions?: Trip[];
  /** Pre-selected option, e.g. the trip the page is filtered to. */
  initialTripId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (booking: Booking) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إضافة حجز</DialogTitle>
          <DialogDescription>
            {trip
              ? `احجز مقاعد على هذه الرحلة نيابةً عن أحد العملاء. المقاعد المتاحة: ${formatNumber(trip.availableSeats)}.`
              : "اختر الرحلة، ثم أدخل بيانات العميل لحجز مقاعد نيابةً عنه."}
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the form starts empty each time. */}
        {open &&
          (trip ? (
            <BookingForm trip={trip} onCancel={() => onOpenChange(false)} onCreated={onCreated} />
          ) : (
            <TripPickerBody
              trips={tripOptions ?? []}
              initialTripId={initialTripId}
              onCancel={() => onOpenChange(false)}
              onCreated={onCreated}
            />
          ))}
      </DialogContent>
    </Dialog>
  );
}

function TripPickerBody({
  trips,
  initialTripId,
  onCancel,
  onCreated,
}: {
  trips: Trip[];
  initialTripId?: string;
  onCancel: () => void;
  onCreated: (booking: Booking) => void;
}) {
  const [tripId, setTripId] = useState(() =>
    trips.some((t) => t.id === initialTripId) ? initialTripId! : "",
  );
  const trip = trips.find((t) => t.id === tripId);

  if (trips.length === 0) {
    return (
      <>
        <p className="py-6 text-center text-sm text-muted-foreground">لا توجد رحلات مفتوحة للحجز حالياً.</p>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            إغلاق
          </Button>
        </DialogFooter>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="booking-trip">الرحلة</FieldLabel>
        <NativeSelect
          id="booking-trip"
          value={tripId}
          onChange={(e) => setTripId(e.target.value)}
          className="w-full [&>select]:h-9 [&>select]:bg-card"
        >
          <NativeSelectOption value="" disabled>
            اختر رحلة…
          </NativeSelectOption>
          {trips.map((t) => (
            <NativeSelectOption key={t.id} value={t.id}>
              {t.tripProgramName} — {formatShortDate(t.takeoffDate)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        {trip && (
          <FieldDescription>
            المقاعد المتاحة: {formatNumber(trip.availableSeats)}
            {trip.isInternational && " · رحلة دولية"}
          </FieldDescription>
        )}
      </Field>
      {trip ? (
        <BookingForm trip={trip} onCancel={onCancel} onCreated={onCreated} />
      ) : (
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button type="button" disabled>
            تأكيد الحجز
          </Button>
        </DialogFooter>
      )}
    </div>
  );
}

function BookingForm({
  trip,
  onCancel,
  onCreated,
}: {
  trip: Trip;
  onCancel: () => void;
  onCreated: (booking: Booking) => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [seats, setSeats] = useState("1");
  const [passports, setPassports] = useState<PassportValues[]>([{ ownerName: "", number: "" }]);
  const [errors, setErrors] = useState<FormErrors>({});

  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (result) => {
      if (result.ok) onCreated(result.value);
    },
  });
  const apiError = mutation.data?.when(
    () => null,
    (error) => ERROR_MESSAGES[error],
  );

  // One passport row per seat, capped at the seats still available.
  const passportCount = Math.min(Math.max(Number(seats) || 0, 0), trip.availableSeats);
  const passportRows = Array.from(
    { length: passportCount },
    (_, i) => passports[i] ?? { ownerName: "", number: "" },
  );

  const updatePassport = (index: number, patch: Partial<PassportValues>) =>
    setPassports(() => {
      const next = [...passportRows];
      next[index] = { ...next[index], ...patch };
      return next;
    });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const phoneNumber = toApiPhoneNumber(phone);
    const seatCount = Number(seats);
    const next: FormErrors = {};

    if (!customerName.trim()) next.customerName = "يرجى إدخال اسم العميل.";
    if (!phoneNumber) next.phone = "يرجى إدخال رقم هاتف عراقي صحيح.";
    if (!/^\d+$/.test(seats) || seatCount < 1) next.seats = "يرجى إدخال عدد مقاعد صحيح (1 أو أكثر).";
    else if (seatCount > trip.availableSeats)
      next.seats = `لا تتوفر إلا ${formatNumber(trip.availableSeats)} من المقاعد.`;

    if (trip.isInternational && !next.seats) {
      const passportErrors: NonNullable<FormErrors["passports"]> = {};
      passportRows.forEach((passport, index) => {
        const rowErrors: { ownerName?: string; number?: string } = {};
        if (!passport.ownerName.trim()) rowErrors.ownerName = "مطلوب";
        if (!passport.number.trim()) rowErrors.number = "مطلوب";
        if (rowErrors.ownerName || rowErrors.number) passportErrors[index] = rowErrors;
      });
      if (Object.keys(passportErrors).length > 0) next.passports = passportErrors;
    }

    setErrors(next);
    if (Object.keys(next).length > 0 || !phoneNumber) return;

    mutation.mutate({
      tripId: trip.id,
      customerName: customerName.trim(),
      phoneNumber,
      seats: seatCount,
      passports: trip.isInternational
        ? passportRows.map((p) => ({ ownerName: p.ownerName.trim(), number: p.number.trim() }))
        : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <FormError message={apiError} />
      <FieldGroup className="gap-4">
        <Field data-invalid={!!errors.customerName}>
          <FieldLabel htmlFor="booking-name">اسم العميل</FieldLabel>
          <Input
            id="booking-name"
            value={customerName}
            maxLength={NAME_MAX}
            onChange={(e) => setCustomerName(e.target.value)}
            aria-invalid={!!errors.customerName}
            autoFocus
          />
          <FieldError>{errors.customerName}</FieldError>
        </Field>
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="booking-phone">رقم الهاتف</FieldLabel>
            <PhoneInput
              id="booking-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={!!errors.phone}
            />
            <FieldError>{errors.phone}</FieldError>
          </Field>
          <Field data-invalid={!!errors.seats}>
            <FieldLabel htmlFor="booking-seats">عدد المقاعد</FieldLabel>
            <Input
              id="booking-seats"
              dir="ltr"
              inputMode="numeric"
              value={seats}
              onChange={(e) => setSeats(e.target.value.replace(/\D/g, ""))}
              aria-invalid={!!errors.seats}
              className="text-end"
            />
            <FieldError>{errors.seats}</FieldError>
          </Field>
        </div>

        {trip.isInternational && passportCount > 0 && (
          <Field>
            <FieldLabel>جوازات السفر</FieldLabel>
            <FieldDescription>رحلة دولية: يلزم إدخال بيانات جواز سفر لكل مقعد.</FieldDescription>
            <ol className="flex flex-col gap-2">
              {passportRows.map((passport, index) => {
                const rowErrors = errors.passports?.[index];
                return (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-2 w-5 shrink-0 text-center text-xs text-muted-foreground tabular-nums">
                      {formatNumber(index + 1)}
                    </span>
                    <Input
                      aria-label={`الاسم في الجواز ${formatNumber(index + 1)}`}
                      placeholder="الاسم كما في الجواز"
                      value={passport.ownerName}
                      maxLength={NAME_MAX}
                      onChange={(e) => updatePassport(index, { ownerName: e.target.value })}
                      aria-invalid={!!rowErrors?.ownerName}
                    />
                    <Input
                      aria-label={`رقم الجواز ${formatNumber(index + 1)}`}
                      placeholder="رقم الجواز"
                      dir="ltr"
                      value={passport.number}
                      maxLength={PASSPORT_NUMBER_MAX}
                      onChange={(e) => updatePassport(index, { number: e.target.value.toUpperCase() })}
                      aria-invalid={!!rowErrors?.number}
                      className="w-36 shrink-0 text-end font-mono"
                    />
                  </li>
                );
              })}
            </ol>
            {errors.passports && <FieldError>يرجى إكمال بيانات جميع الجوازات.</FieldError>}
          </Field>
        )}
      </FieldGroup>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Spinner />}
          تأكيد الحجز
        </Button>
      </DialogFooter>
    </form>
  );
}

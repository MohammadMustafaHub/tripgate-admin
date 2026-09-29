import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheckIcon } from "lucide-react";
import { getTripProgram, listTripPrograms } from "@/api/trip-programs";
import type { createTrip } from "@/api/trips";
import { FormError } from "@/components/form/form-error";
import { FormActions, FormSection } from "@/components/form/form-section";
import { RemoteImage } from "@/components/remote-image";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { fromDateTimeInput, toDateTimeInput } from "@/lib/datetime-input";
import {
  DAY_FORMS,
  SEAT_FORMS,
  formatDate,
  formatNumber,
  formatPrice,
  formatTransport,
  pluralize,
} from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { scrollToFirstError } from "@/lib/scroll-to-error";
import type { Trip } from "@/models/trip";
import type { TripProgram } from "@/models/trip-program";

export type TripFormOutput = Parameters<typeof createTrip>[0];

const DAY_MS = 24 * 60 * 60 * 1000;
// Enough for a picker; the API caps page size at 100.
const PROGRAM_OPTIONS_LIMIT = 100;

interface FormValues {
  tripProgramId: string;
  takeoffDate: string;
  finalRegistrationDate: string;
  price: string;
  seats: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const isPositiveInt = (value: string) => /^\d+$/.test(value) && Number(value) >= 1;

export function TripForm({
  trip,
  initialProgramId,
  submitLabel,
  cancelTo,
  pending,
  error,
  onSubmit,
}: {
  /** The trip being edited; omit to schedule a new one. */
  trip?: Trip;
  /** Pre-selects a program when scheduling, e.g. from a program's page. */
  initialProgramId?: string;
  submitLabel: string;
  cancelTo: string;
  pending: boolean;
  error?: string | null;
  onSubmit: (values: TripFormOutput) => void;
}) {
  const editing = !!trip;
  const [values, setValues] = useState<FormValues>(() => ({
    tripProgramId: trip?.tripProgramId ?? initialProgramId ?? "",
    takeoffDate: trip ? toDateTimeInput(trip.takeoffDate) : "",
    finalRegistrationDate: trip ? toDateTimeInput(trip.finalRegistrationDate) : "",
    price: trip ? String(trip.pricePerSeat) : "",
    seats: trip ? String(trip.seats) : "",
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const set = (key: keyof FormValues, value: string) => setValues((current) => ({ ...current, [key]: value }));

  // Scheduling picks from the program list; editing only needs the trip's own program.
  const programsQuery = useQuery({
    queryKey: ["trip-programs", "options"],
    queryFn: () => listTripPrograms({ page: 1, pageSize: PROGRAM_OPTIONS_LIMIT }),
    enabled: !editing,
  });
  const programQuery = useQuery({
    queryKey: ["trip-programs", "detail", values.tripProgramId],
    queryFn: () => getTripProgram({ id: values.tripProgramId }),
    enabled: editing,
  });

  const programs = programsQuery.data?.ok ? programsQuery.data.value.data : [];
  const program = editing
    ? programQuery.data?.ok
      ? programQuery.data.value
      : undefined
    : programs.find((p) => p.id === values.tripProgramId);

  function validate(): FormErrors {
    const next: FormErrors = {};
    const takeoff = fromDateTimeInput(values.takeoffDate);
    const closes = fromDateTimeInput(values.finalRegistrationDate);

    if (!values.tripProgramId) next.tripProgramId = "يرجى اختيار برنامج الرحلة.";
    if (!takeoff) next.takeoffDate = "يرجى تحديد موعد الانطلاق.";
    else if (!editing && new Date(takeoff).getTime() <= Date.now())
      next.takeoffDate = "يجب أن يكون موعد الانطلاق في المستقبل.";
    if (!closes) next.finalRegistrationDate = "يرجى تحديد آخر موعد للتسجيل.";
    else if (takeoff && closes > takeoff)
      next.finalRegistrationDate = "يجب ألا يتجاوز آخر موعد للتسجيل موعد الانطلاق.";

    const price = values.price.trim();
    if (price ? !/^\d+(\.\d+)?$/.test(price) : editing) next.price = "يرجى إدخال سعر صحيح.";

    const seats = values.seats.trim();
    if (seats ? !isPositiveInt(seats) : editing) next.seats = "يرجى إدخال عدد مقاعد صحيح (1 أو أكثر).";
    else if (trip && Number(seats) < trip.reservedSeats)
      next.seats = `لا يمكن أن يقل عدد المقاعد عن المحجوز حالياً (${formatNumber(trip.reservedSeats)}).`;

    return next;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      scrollToFirstError();
      return;
    }
    onSubmit({
      tripProgramId: values.tripProgramId,
      takeoffDate: fromDateTimeInput(values.takeoffDate)!,
      finalRegistrationDate: fromDateTimeInput(values.finalRegistrationDate)!,
      // Empty means "use the program's default" when scheduling.
      pricePerSeat: values.price.trim() ? Number(values.price) : null,
      seats: values.seats.trim() ? Number(values.seats) : null,
    });
  }

  const takeoffIso = fromDateTimeInput(values.takeoffDate);
  const returnDate =
    program && takeoffIso
      ? new Date(new Date(takeoffIso).getTime() + (Math.max(program.totalDays, 1) - 1) * DAY_MS)
      : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col">
      <FormError message={error} />

      <FormSection
        title="البرنامج"
        description={
          editing
            ? "البرنامج الذي جُدولت منه الرحلة، ولا يمكن تغييره بعد الجدولة."
            : "اختر البرنامج الذي تُجدول منه الرحلة؛ تُؤخذ منه المسار والقيم الافتراضية."
        }
      >
        {!editing && (
          <Field data-invalid={!!errors.tripProgramId}>
            <FieldLabel htmlFor="program">برنامج الرحلة</FieldLabel>
            {programsQuery.isPending ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <NativeSelect
                id="program"
                value={values.tripProgramId}
                onChange={(e) => set("tripProgramId", e.target.value)}
                aria-invalid={!!errors.tripProgramId}
                className="w-full [&>select]:h-9 [&>select]:bg-card"
              >
                <NativeSelectOption value="" disabled>
                  اختر برنامجاً…
                </NativeSelectOption>
                {programs.map((p) => (
                  <NativeSelectOption key={p.id} value={p.id}>
                    {p.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
            {programsQuery.data && !programsQuery.data.ok && (
              <FieldDescription className="text-destructive">تعذّر تحميل قائمة البرامج.</FieldDescription>
            )}
            <FieldError>{errors.tripProgramId}</FieldError>
          </Field>
        )}
        {program ? (
          <ProgramSummary program={program} />
        ) : (
          editing && programQuery.isPending && <Skeleton className="h-24 w-full rounded-xl" />
        )}
      </FormSection>

      <FormSection title="المواعيد" description="موعد انطلاق الرحلة، وآخر موعد يُسمح فيه بالتسجيل والحجز.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.takeoffDate}>
            <FieldLabel htmlFor="takeoff">موعد الانطلاق</FieldLabel>
            <Input
              id="takeoff"
              type="datetime-local"
              dir="ltr"
              value={values.takeoffDate}
              onChange={(e) => set("takeoffDate", e.target.value)}
              aria-invalid={!!errors.takeoffDate}
              className="bg-card text-end"
            />
            <FieldError>{errors.takeoffDate}</FieldError>
          </Field>
          <Field data-invalid={!!errors.finalRegistrationDate}>
            <FieldLabel htmlFor="closes">آخر موعد للتسجيل</FieldLabel>
            <Input
              id="closes"
              type="datetime-local"
              dir="ltr"
              value={values.finalRegistrationDate}
              max={values.takeoffDate || undefined}
              onChange={(e) => set("finalRegistrationDate", e.target.value)}
              aria-invalid={!!errors.finalRegistrationDate}
              className="bg-card text-end"
            />
            <FieldError>{errors.finalRegistrationDate}</FieldError>
          </Field>
        </div>
        {returnDate && (
          <p className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2.5 text-sm">
            <CalendarCheckIcon className="size-4 text-muted-foreground" />
            العودة المتوقعة: <span className="font-medium">{formatDate(returnDate)}</span>
            <span className="text-muted-foreground">({pluralize(program!.totalDays, DAY_FORMS)})</span>
          </p>
        )}
      </FormSection>

      <FormSection
        title="السعر والمقاعد"
        description={
          editing
            ? "سعر المقعد وعدد المقاعد لهذه الرحلة."
            : "اترك الحقل فارغاً لاستخدام القيمة الافتراضية للبرنامج."
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.price}>
            <FieldLabel htmlFor="price">سعر المقعد</FieldLabel>
            <InputGroup className="h-9 bg-card">
              <InputGroupInput
                id="price"
                dir="ltr"
                inputMode="decimal"
                value={values.price}
                onChange={(e) => set("price", e.target.value.replace(/[^\d.]/g, ""))}
                aria-invalid={!!errors.price}
                placeholder={program ? String(program.defaultPricePerSeat) : undefined}
                className="text-end"
              />
              <InputGroupAddon align="inline-end">د.ع</InputGroupAddon>
            </InputGroup>
            {!editing && program && (
              <FieldDescription>الافتراضي: {formatPrice(program.defaultPricePerSeat)}</FieldDescription>
            )}
            <FieldError>{errors.price}</FieldError>
          </Field>
          <Field data-invalid={!!errors.seats}>
            <FieldLabel htmlFor="seats">عدد المقاعد</FieldLabel>
            <Input
              id="seats"
              dir="ltr"
              inputMode="numeric"
              value={values.seats}
              onChange={(e) => set("seats", e.target.value.replace(/\D/g, ""))}
              aria-invalid={!!errors.seats}
              placeholder={program ? String(program.defaultSeats) : undefined}
              className="bg-card text-end"
            />
            {!editing && program && (
              <FieldDescription>الافتراضي: {pluralize(program.defaultSeats, SEAT_FORMS)}</FieldDescription>
            )}
            {trip && trip.reservedSeats > 0 && (
              <FieldDescription>المحجوز حالياً: {pluralize(trip.reservedSeats, SEAT_FORMS)}</FieldDescription>
            )}
            <FieldError>{errors.seats}</FieldError>
          </Field>
        </div>
      </FormSection>

      <FormActions cancelTo={cancelTo} submitLabel={submitLabel} pending={pending} />
    </form>
  );
}

function ProgramSummary({ program }: { program: TripProgram }) {
  return (
    <div className="flex h-24 overflow-hidden rounded-xl border">
      <RemoteImage src={imageUrl(program.coverImage)} alt={program.name} className="h-full w-28 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 border-s px-4">
        <span className="truncate font-semibold">{program.name}</span>
        <span className="text-xs text-muted-foreground">
          {pluralize(program.totalDays, DAY_FORMS)} · {formatTransport(program.transportMethod)} ·{" "}
          {program.isInternational ? "دولي" : "محلي"}
        </span>
      </div>
    </div>
  );
}

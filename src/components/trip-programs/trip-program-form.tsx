import { useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { uploadImage, uploadImages } from "@/api/media";
import type { createTripProgram } from "@/api/trip-programs";
import { FormError } from "@/components/form/form-error";
import { FormActions, FormSection } from "@/components/form/form-section";
import { ImageUpload } from "@/components/image-upload";
import { MultiImageUpload } from "@/components/multi-image-upload";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { scrollToFirstError } from "@/lib/scroll-to-error";
import { DAY_FORMS, formatNumber, formatTransport, pluralize } from "@/lib/format";
import type { TripProgram } from "@/models/trip-program";

export type TripProgramFormOutput = Parameters<typeof createTripProgram>[0];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 10;
const NAME_MAX = 200;
const TEXT_MAX = 4000;

// Values stored by the API; labels come from formatTransport.
const TRANSPORT_METHODS = ["Bus", "Flight", "Car", "Train"];

interface StepValues {
  /** Local key for React lists; not sent to the API. */
  id: string;
  days: string;
  description: string;
}

interface FormValues {
  name: string;
  description: string;
  isInternational: boolean;
  coverImage: string | null;
  images: string[];
  price: string;
  seats: string;
  transportMethod: string;
  steps: StepValues[];
}

interface FormErrors {
  name?: string;
  description?: string;
  coverImage?: string;
  price?: string;
  seats?: string;
  transportMethod?: string;
  steps?: string;
  stepFields?: Record<string, { days?: string; description?: string }>;
}

const newStep = (): StepValues => ({ id: crypto.randomUUID(), days: "1", description: "" });

function toFormValues(program?: TripProgram): FormValues {
  if (!program) {
    return {
      name: "",
      description: "",
      isInternational: false,
      coverImage: null,
      images: [],
      price: "",
      seats: "",
      transportMethod: TRANSPORT_METHODS[0],
      steps: [newStep()],
    };
  }
  return {
    name: program.name,
    description: program.description,
    isInternational: program.isInternational,
    coverImage: program.coverImage || null,
    images: program.images,
    price: String(program.defaultPricePerSeat),
    seats: String(program.defaultSeats),
    transportMethod: program.transportMethod,
    steps: [...program.steps]
      .sort((a, b) => a.position - b.position)
      .map((step) => ({ id: crypto.randomUUID(), days: String(step.days), description: step.description })),
  };
}

const isPositiveInt = (value: string) => /^\d+$/.test(value) && Number(value) >= 1;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "يرجى إدخال اسم البرنامج.";
  else if (values.name.trim().length > NAME_MAX) errors.name = `يجب ألا يتجاوز الاسم ${NAME_MAX} حرف.`;
  if (!values.description.trim()) errors.description = "يرجى إدخال وصف البرنامج.";
  if (!values.coverImage) errors.coverImage = "يرجى إضافة صورة الغلاف.";
  if (!/^\d+(\.\d+)?$/.test(values.price.trim())) errors.price = "يرجى إدخال سعر صحيح.";
  if (!isPositiveInt(values.seats.trim())) errors.seats = "يرجى إدخال عدد مقاعد صحيح (1 أو أكثر).";
  if (!values.transportMethod) errors.transportMethod = "يرجى اختيار وسيلة النقل.";
  if (values.steps.length === 0) errors.steps = "يرجى إضافة مرحلة واحدة على الأقل.";

  const stepFields: NonNullable<FormErrors["stepFields"]> = {};
  for (const step of values.steps) {
    const stepErrors: { days?: string; description?: string } = {};
    if (!isPositiveInt(step.days.trim())) stepErrors.days = "عدد أيام غير صحيح.";
    if (!step.description.trim()) stepErrors.description = "يرجى وصف هذه المرحلة.";
    if (stepErrors.days || stepErrors.description) stepFields[step.id] = stepErrors;
  }
  if (Object.keys(stepFields).length > 0) errors.stepFields = stepFields;
  return errors;
}

function toOutput(values: FormValues): TripProgramFormOutput {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    isInternational: values.isInternational,
    coverImage: values.coverImage!,
    images: values.images,
    defaultPricePerSeat: Number(values.price),
    defaultSeats: Number(values.seats),
    transportMethod: values.transportMethod,
    steps: values.steps.map((step, index) => ({
      position: index + 1,
      days: Number(step.days),
      description: step.description.trim(),
    })),
  };
}

export function TripProgramForm({
  program,
  submitLabel,
  cancelTo,
  pending,
  error,
  onSubmit,
}: {
  /** The program being edited; omit to create a new one. */
  program?: TripProgram;
  submitLabel: string;
  cancelTo: string;
  pending: boolean;
  error?: string | null;
  onSubmit: (values: TripProgramFormOutput) => void;
}) {
  const [values, setValues] = useState(() => toFormValues(program));
  const [errors, setErrors] = useState<FormErrors>({});

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const updateStep = (id: string, patch: Partial<StepValues>) =>
    set(
      "steps",
      values.steps.map((step) => (step.id === id ? { ...step, ...patch } : step)),
    );

  const moveStep = (index: number, offset: -1 | 1) => {
    const steps = [...values.steps];
    [steps[index], steps[index + offset]] = [steps[index + offset], steps[index]];
    set("steps", steps);
  };

  const transportOptions = TRANSPORT_METHODS.includes(values.transportMethod)
    ? TRANSPORT_METHODS
    : [...TRANSPORT_METHODS, values.transportMethod];
  const totalDays = values.steps.reduce((sum, step) => sum + (isPositiveInt(step.days) ? Number(step.days) : 0), 0);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next = validate(values);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      scrollToFirstError();
      return;
    }
    onSubmit(toOutput(values));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col">
      <FormError message={error} />

      <FormSection title="المعلومات الأساسية" description="الاسم والوصف اللذان يظهران لعملائك عند تصفح البرامج.">
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">اسم البرنامج</FieldLabel>
          <Input
            id="name"
            value={values.name}
            maxLength={NAME_MAX}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={!!errors.name}
            placeholder="مثال: رحلة إلى أربيل وشقلاوة"
          />
          <FieldError>{errors.name}</FieldError>
        </Field>
        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">الوصف</FieldLabel>
          <Textarea
            id="description"
            value={values.description}
            maxLength={TEXT_MAX}
            onChange={(e) => set("description", e.target.value)}
            aria-invalid={!!errors.description}
            className="min-h-32 bg-card"
            placeholder="صف البرنامج وأبرز ما يميّزه…"
          />
          <FieldError>{errors.description}</FieldError>
        </Field>
        <Field orientation="horizontal" className="rounded-lg border p-4">
          <div className="flex flex-1 flex-col gap-1">
            <FieldLabel htmlFor="international">رحلة دولية</FieldLabel>
            <FieldDescription>تتطلب الحجوزات على هذا البرنامج إدخال بيانات جواز السفر.</FieldDescription>
          </div>
          <Switch
            id="international"
            checked={values.isInternational}
            onCheckedChange={(checked) => set("isInternational", checked)}
          />
        </Field>
      </FormSection>

      <FormSection title="الصور" description="صورة الغلاف تظهر في قائمة البرامج، وصور المعرض في صفحة البرنامج.">
        <Field data-invalid={!!errors.coverImage}>
          <FieldLabel htmlFor="cover-image">صورة الغلاف</FieldLabel>
          <ImageUpload
            id="cover-image"
            value={values.coverImage}
            onChange={(key) => set("coverImage", key)}
            upload={(file) => uploadImage({ file })}
            maxSize={MAX_IMAGE_SIZE}
            invalid={!!errors.coverImage}
          />
          <FieldError>{errors.coverImage}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="gallery">معرض الصور</FieldLabel>
          <MultiImageUpload
            id="gallery"
            value={values.images}
            onChange={(keys) => set("images", keys)}
            upload={(files) => uploadImages({ files })}
            maxSize={MAX_IMAGE_SIZE}
            maxFiles={MAX_GALLERY_IMAGES}
          />
        </Field>
      </FormSection>

      <FormSection title="التسعير والنقل" description="القيم الافتراضية للرحلات المجدولة من هذا البرنامج، ويمكن تعديلها لكل رحلة.">
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
                placeholder="250000"
                className="text-end"
              />
              <InputGroupAddon align="inline-end">د.ع</InputGroupAddon>
            </InputGroup>
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
              placeholder="40"
              className="text-end"
            />
            <FieldError>{errors.seats}</FieldError>
          </Field>
          <Field data-invalid={!!errors.transportMethod}>
            <FieldLabel htmlFor="transport">وسيلة النقل</FieldLabel>
            <NativeSelect
              id="transport"
              value={values.transportMethod}
              onChange={(e) => set("transportMethod", e.target.value)}
              aria-invalid={!!errors.transportMethod}
              className="w-full [&>select]:h-9 [&>select]:bg-card"
            >
              {transportOptions.map((method) => (
                <NativeSelectOption key={method} value={method}>
                  {formatTransport(method)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError>{errors.transportMethod}</FieldError>
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="مسار الرحلة"
        description={`مراحل البرنامج بالترتيب. المدة الإجمالية: ${pluralize(totalDays, DAY_FORMS)}.`}
      >
        <ol className="flex flex-col gap-3">
          {values.steps.map((step, index) => {
            const stepErrors = errors.stepFields?.[step.id];
            return (
              <li key={step.id} className="flex gap-3 rounded-xl border p-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-dark text-xs font-semibold text-white">
                  {formatNumber(index + 1)}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <Field data-invalid={!!stepErrors?.days} className="w-40">
                    <FieldLabel htmlFor={`step-days-${step.id}`}>عدد الأيام</FieldLabel>
                    <Input
                      id={`step-days-${step.id}`}
                      dir="ltr"
                      inputMode="numeric"
                      value={step.days}
                      onChange={(e) => updateStep(step.id, { days: e.target.value.replace(/\D/g, "") })}
                      aria-invalid={!!stepErrors?.days}
                      className="text-end"
                    />
                    <FieldError>{stepErrors?.days}</FieldError>
                  </Field>
                  <Field data-invalid={!!stepErrors?.description}>
                    <FieldLabel htmlFor={`step-description-${step.id}`}>الوصف</FieldLabel>
                    <Textarea
                      id={`step-description-${step.id}`}
                      value={step.description}
                      maxLength={TEXT_MAX}
                      onChange={(e) => updateStep(step.id, { description: e.target.value })}
                      aria-invalid={!!stepErrors?.description}
                      className="bg-card"
                      placeholder="ماذا يحدث في هذه المرحلة؟"
                    />
                    <FieldError>{stepErrors?.description}</FieldError>
                  </Field>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="نقل المرحلة للأعلى"
                    disabled={index === 0}
                    onClick={() => moveStep(index, -1)}
                  >
                    <ArrowUpIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="نقل المرحلة للأسفل"
                    disabled={index === values.steps.length - 1}
                    onClick={() => moveStep(index, 1)}
                  >
                    <ArrowDownIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="حذف المرحلة"
                    className="text-destructive hover:text-destructive"
                    onClick={() => set("steps", values.steps.filter((s) => s.id !== step.id))}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>
        {errors.steps && <FieldError>{errors.steps}</FieldError>}
        <Button type="button" variant="outline" className="self-start" onClick={() => set("steps", [...values.steps, newStep()])}>
          <PlusIcon />
          إضافة مرحلة
        </Button>
      </FormSection>

      <FormActions cancelTo={cancelTo} submitLabel={submitLabel} pending={pending} />
    </form>
  );
}

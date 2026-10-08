import { useState } from "react";
import { PaletteIcon } from "lucide-react";
import { uploadImage } from "@/api/media";
import type { updateTenant } from "@/api/tenants";
import { FormError } from "@/components/form/form-error";
import { FormActions, FormSection } from "@/components/form/form-section";
import { ImageUpload } from "@/components/image-upload";
import { ThemePreview } from "@/components/tenant/theme-preview";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { tenantHost } from "@/lib/tenant-url";
import {
  THEME_COLORS,
  THEME_PRESETS,
  findThemePreset,
  isHexColor,
  toColorInputValue,
  withDefaults,
} from "@/lib/tenant-theme";
import { ok } from "@/lib/result";
import { scrollToFirstError } from "@/lib/scroll-to-error";
import type { Tenant, TenantTheme } from "@/models/tenant";

export type TenantFormOutput = Parameters<typeof updateTenant>[0];

const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const NAME_MAX = 200;
const LOGO_URL_MAX = 500;
const CUSTOM_THEME = "custom";

interface FormValues {
  name: string;
  logoUrl: string | null;
  theme: TenantTheme;
}

interface FormErrors {
  name?: string;
  logoUrl?: string;
  theme?: Partial<Record<keyof TenantTheme, string>>;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "يرجى إدخال اسم المؤسسة.";
  else if (values.name.trim().length > NAME_MAX) errors.name = `يجب ألا يتجاوز الاسم ${NAME_MAX} حرف.`;
  if (values.logoUrl && values.logoUrl.length > LOGO_URL_MAX) errors.logoUrl = "رابط الشعار طويل جداً.";

  const theme: NonNullable<FormErrors["theme"]> = {};
  for (const { key } of THEME_COLORS) {
    if (!isHexColor(values.theme[key])) theme[key] = "لون غير صالح، مثال: ‎#1E40AF";
  }
  if (Object.keys(theme).length > 0) errors.theme = theme;
  return errors;
}

// The tenant stores its logo as a public URL rather than a storage key, so the URL is
// what ImageUpload reports through onChange.
async function uploadLogo(file: File) {
  const result = await uploadImage({ file });
  return result.ok ? ok({ ...result.value, key: result.value.url }) : result;
}

export function TenantForm({
  tenant,
  cancelTo,
  pending,
  error,
  onSubmit,
}: {
  tenant: Tenant;
  cancelTo: string;
  pending: boolean;
  error?: string | null;
  onSubmit: (values: TenantFormOutput) => void;
}) {
  const [values, setValues] = useState<FormValues>(() => ({
    name: tenant.name,
    logoUrl: tenant.logoUrl,
    theme: withDefaults(tenant.theme),
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  /** A preset id, or CUSTOM_THEME while the colours are picked one by one. */
  const [themeChoice, setThemeChoice] = useState(() => findThemePreset(values.theme)?.id ?? CUSTOM_THEME);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));
  const setColor = (key: keyof TenantTheme, value: string) =>
    setValues((current) => ({ ...current, theme: { ...current.theme, [key]: value } }));

  // Picking "custom" keeps the current colours as a starting point to adjust.
  function chooseTheme(choice: string) {
    setThemeChoice(choice);
    const preset = THEME_PRESETS.find((p) => p.id === choice);
    if (preset) {
      set("theme", preset.theme);
      setErrors((current) => ({ ...current, theme: undefined }));
    }
  }

  // Colours still being typed fall back to their saved value so the preview never breaks.
  const savedTheme = withDefaults(tenant.theme);
  const previewTheme = { ...values.theme };
  for (const { key } of THEME_COLORS) {
    if (!isHexColor(previewTheme[key])) previewTheme[key] = savedTheme[key];
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next = validate(values);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      scrollToFirstError();
      return;
    }
    onSubmit({ name: values.name.trim(), logoUrl: values.logoUrl, theme: values.theme });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col">
      <FormError message={error} />

      <FormSection title="الهوية" description="الاسم والشعار اللذان يظهران لعملائك في موقع مؤسستك.">
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">اسم المؤسسة</FieldLabel>
          <Input
            id="name"
            value={values.name}
            maxLength={NAME_MAX}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={!!errors.name}
            placeholder="مثال: شركة الرافدين للسياحة"
          />
          <FieldError>{errors.name}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="subdomain">رابط الموقع</FieldLabel>
          <Input id="subdomain" dir="ltr" value={tenantHost(tenant.subdomain)} disabled className="text-end" />
          <FieldDescription>لا يمكن تغيير رابط الموقع بعد إنشاء المؤسسة.</FieldDescription>
        </Field>
        <Field data-invalid={!!errors.logoUrl}>
          <FieldLabel htmlFor="logo">الشعار</FieldLabel>
          <ImageUpload
            id="logo"
            value={values.logoUrl}
            onChange={(url) => set("logoUrl", url)}
            upload={uploadLogo}
            maxSize={MAX_LOGO_SIZE}
            invalid={!!errors.logoUrl}
            fit="contain"
            className="aspect-[3/2] max-w-sm"
          />
          <FieldDescription>يُفضّل شعار مربع بخلفية شفافة.</FieldDescription>
          <FieldError>{errors.logoUrl}</FieldError>
        </Field>
      </FormSection>

      <FormSection title="ألوان الموقع" description="اختر أحد الأنماط الجاهزة أو خصّص الألوان بنفسك. تتحدث المعاينة مع كل تغيير.">
        <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
          <div className="flex min-w-0 flex-col gap-6">
            <RadioGroup
              aria-label="نمط الألوان"
              value={themeChoice}
              onValueChange={(value) => chooseTheme(value as string)}
              className="grid-cols-2 sm:grid-cols-3 2xl:grid-cols-4"
            >
              {THEME_PRESETS.map((preset) => (
                <ThemeChoice key={preset.id} value={preset.id} label={preset.label}>
                  <ThemeSwatches theme={preset.theme} />
                </ThemeChoice>
              ))}
              <ThemeChoice value={CUSTOM_THEME} label="مخصص">
                <span className="flex h-8 items-center justify-center rounded-md border border-dashed text-muted-foreground">
                  <PaletteIcon className="size-4" />
                </span>
              </ThemeChoice>
            </RadioGroup>

            {themeChoice === CUSTOM_THEME && (
              <div className="grid content-start gap-x-5 gap-y-4 sm:grid-cols-2">
                {THEME_COLORS.map(({ key, label, description }) => (
                  <ColorField
                    key={key}
                    id={`color-${key}`}
                    label={label}
                    description={description}
                    value={values.theme[key]}
                    error={errors.theme?.[key]}
                    onChange={(value) => setColor(key, value)}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="xl:sticky xl:top-4 xl:self-start">
            <ThemePreview theme={previewTheme} name={values.name} logoUrl={values.logoUrl} />
          </div>
        </div>
      </FormSection>

      <FormActions cancelTo={cancelTo} submitLabel="حفظ التعديلات" pending={pending} />
    </form>
  );
}

/** A selectable card in the theme picker. */
function ThemeChoice({ value, label, children }: { value: string; label: string; children: React.ReactNode }) {
  const id = `theme-${value}`;
  return (
    <FieldLabel htmlFor={id}>
      <Field>
        {children}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{label}</span>
          <RadioGroupItem id={id} value={value} />
        </div>
      </Field>
    </FieldLabel>
  );
}

/** The colours that most shape a theme's look, as a strip. */
function ThemeSwatches({ theme }: { theme: TenantTheme }) {
  return (
    <span className="flex h-8 overflow-hidden rounded-md border">
      {[theme.background, theme.primary, theme.accent, theme.text].map((color, index) => (
        <span key={index} className="flex-1" style={{ backgroundColor: color }} />
      ))}
    </span>
  );
}

function ColorField({
  id,
  label,
  description,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div dir="ltr" className="flex items-center gap-2">
        <label
          className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-md border shadow-xs focus-within:ring-3 focus-within:ring-ring/50"
          style={{ backgroundColor: isHexColor(value) ? value : undefined }}
        >
          <input
            type="color"
            aria-label={`اختيار ${label}`}
            value={toColorInputValue(value)}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </label>
        <Input
          id={id}
          value={value}
          maxLength={9}
          onChange={(e) => onChange(e.target.value.trim())}
          aria-invalid={!!error}
          spellCheck={false}
          className="font-mono uppercase"
          placeholder="#1E40AF"
        />
      </div>
      {error ? <FieldError>{error}</FieldError> : <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
}

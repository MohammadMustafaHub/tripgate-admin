// Latin digits keep numbers consistent with phone numbers and prices across the app.
const LOCALE = "ar-IQ-u-nu-latn";

const numberFormatter = new Intl.NumberFormat(LOCALE);
const dateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: "long" });
const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium", timeStyle: "short" });
const shortDateFormatter = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "long" });
const dayFormatter = new Intl.DateTimeFormat(LOCALE, { day: "numeric" });
const monthFormatter = new Intl.DateTimeFormat(LOCALE, { month: "long" });
const weekdayFormatter = new Intl.DateTimeFormat(LOCALE, { weekday: "long" });
const timeFormatter = new Intl.DateTimeFormat(LOCALE, { timeStyle: "short" });
const pluralRules = new Intl.PluralRules("ar");

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatDate(value: string | Date): string {
  return dateFormatter.format(new Date(value));
}

/** e.g. "12 تشرين الأول 2026، 8:00 ص" */
export function formatDateTime(value: string | Date): string {
  return dateTimeFormatter.format(new Date(value));
}

/** e.g. "12 تشرين الأول" */
export function formatShortDate(value: string | Date): string {
  return shortDateFormatter.format(new Date(value));
}

/** Separate parts for calendar-style date tiles. */
export function dateParts(value: string | Date) {
  const date = new Date(value);
  return {
    day: dayFormatter.format(date),
    month: monthFormatter.format(date),
    weekday: weekdayFormatter.format(date),
    time: timeFormatter.format(date),
  };
}

const relativeFormatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });
const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole calendar days from today, e.g. "غداً", "بعد 5 أيام", "قبل يومين". */
export function formatRelativeDay(value: string | Date): string {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(new Date(value)) - startOfDay(new Date())) / DAY_MS);
  return relativeFormatter.format(days, "day");
}

const compactFormatter = new Intl.NumberFormat(LOCALE, { notation: "compact", maximumFractionDigits: 1 });

/** Short form for large numbers, e.g. 12500000 -> "12.5 مليون". */
export function formatCompact(value: number): string {
  return compactFormatter.format(value);
}

/** Short Iraqi dinar amount, e.g. "12.5 مليون د.ع" */
export function formatCompactPrice(value: number): string {
  return `${compactFormatter.format(value)} د.ع`;
}

/** Iraqi dinar amount, e.g. "250,000 د.ع" */
export function formatPrice(value: number): string {
  return `${numberFormatter.format(value)} د.ع`;
}

interface ArabicForms {
  /** 1 */
  one: string;
  /** 2 */
  two: string;
  /** 3–10 */
  few: string;
  /** 11–99 */
  many: string;
  /** 0 and 100+ */
  other: string;
}

/** Number followed by the correct Arabic plural form, e.g. 3 -> "3 أيام", 11 -> "11 يوماً". */
export function pluralize(count: number, forms: ArabicForms): string {
  const category = pluralRules.select(count);
  if (category === "one") return forms.one;
  if (category === "two") return forms.two;
  const form = category === "zero" ? forms.other : forms[category as keyof ArabicForms];
  return `${formatNumber(count)} ${form}`;
}

export const DAY_FORMS: ArabicForms = { one: "يوم واحد", two: "يومان", few: "أيام", many: "يوماً", other: "يوم" };
export const SEAT_FORMS: ArabicForms = { one: "مقعد واحد", two: "مقعدان", few: "مقاعد", many: "مقعداً", other: "مقعد" };

const TRANSPORT_LABELS: Record<string, string> = {
  bus: "حافلة",
  flight: "طيران",
  plane: "طيران",
  air: "طيران",
  car: "سيارة",
  train: "قطار",
  ship: "سفينة",
};

/** Arabic label for the API's free-text transport method; unknown values are shown as-is. */
export function formatTransport(method: string): string {
  return TRANSPORT_LABELS[method.trim().toLowerCase()] ?? method;
}

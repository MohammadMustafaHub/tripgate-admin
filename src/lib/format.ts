// Latin digits keep numbers consistent with phone numbers and prices across the app.
const LOCALE = "ar-IQ-u-nu-latn";

const numberFormatter = new Intl.NumberFormat(LOCALE);
const dateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: "long" });
const pluralRules = new Intl.PluralRules("ar");

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatDate(value: string | Date): string {
  return dateFormatter.format(new Date(value));
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

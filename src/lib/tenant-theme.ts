import type { TenantTheme } from "@/models/tenant";

/** Theme colours in the order they are shown, with what each one paints on the client site. */
export const THEME_COLORS: { key: keyof TenantTheme; label: string; description: string }[] = [
  { key: "background", label: "الخلفية", description: "خلفية الصفحات." },
  { key: "surface", label: "البطاقات", description: "البطاقات واللوحات فوق الخلفية." },
  { key: "text", label: "النص", description: "النص الرئيسي." },
  { key: "mutedText", label: "النص الثانوي", description: "النصوص الثانوية والتسميات." },
  { key: "border", label: "الحدود", description: "الحدود والفواصل." },
  { key: "primary", label: "اللون الأساسي", description: "الأزرار الرئيسية والروابط والأسعار." },
  { key: "onPrimary", label: "النص على الأساسي", description: "النص والأيقونات فوق اللون الأساسي." },
  { key: "accent", label: "لون التمييز", description: "العناصر المميزة مثل شارات الحالة." },
  { key: "onAccent", label: "النص على التمييز", description: "النص فوق لون التمييز." },
  { key: "success", label: "النجاح", description: "حالات النجاح، مثل علامة تأكيد الحجز." },
  { key: "danger", label: "الخطر", description: "الأخطاء وتنبيهات المقاعد القليلة." },
];

export interface ThemePreset {
  id: string;
  label: string;
  theme: TenantTheme;
}

/** Ready-made themes the tenant can pick instead of choosing every colour. */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "teal",
    label: "فيروزي",
    theme: {
      background: "#F4F6F8",
      surface: "#FFFFFF",
      text: "#0F1D2B",
      mutedText: "#5D6B7A",
      border: "#E0E5EB",
      primary: "#0B5563",
      onPrimary: "#FFFFFF",
      accent: "#9A6412",
      onAccent: "#FFFFFF",
      success: "#157347",
      danger: "#B42318",
    },
  },
  {
    id: "royal-blue",
    label: "أزرق ملكي",
    theme: {
      background: "#F5F7FB",
      surface: "#FFFFFF",
      text: "#111827",
      mutedText: "#5B6475",
      border: "#DFE3EC",
      primary: "#1E3A8A",
      onPrimary: "#FFFFFF",
      accent: "#B45309",
      onAccent: "#FFFFFF",
      success: "#15803D",
      danger: "#B91C1C",
    },
  },
  {
    id: "terracotta",
    label: "طيني دافئ",
    theme: {
      background: "#FAF7F2",
      surface: "#FFFFFF",
      text: "#2B2118",
      mutedText: "#6F6252",
      border: "#E8DFD3",
      primary: "#9A3412",
      onPrimary: "#FFFFFF",
      accent: "#0F766E",
      onAccent: "#FFFFFF",
      success: "#3F7D20",
      danger: "#B42318",
    },
  },
  {
    id: "emerald",
    label: "زمردي",
    theme: {
      background: "#F3F7F5",
      surface: "#FFFFFF",
      text: "#0F2A1F",
      mutedText: "#557064",
      border: "#DCE7E1",
      primary: "#065F46",
      onPrimary: "#FFFFFF",
      accent: "#A16207",
      onAccent: "#FFFFFF",
      success: "#15803D",
      danger: "#B91C1C",
    },
  },
  {
    id: "burgundy",
    label: "خمري",
    theme: {
      background: "#FAF5F6",
      surface: "#FFFFFF",
      text: "#2A1418",
      mutedText: "#725A5F",
      border: "#EBDDE0",
      primary: "#881337",
      onPrimary: "#FFFFFF",
      accent: "#0E7490",
      onAccent: "#FFFFFF",
      success: "#15803D",
      danger: "#C2410C",
    },
  },
  {
    id: "indigo",
    label: "نيلي",
    theme: {
      background: "#F6F5FB",
      surface: "#FFFFFF",
      text: "#1B1733",
      mutedText: "#615C7A",
      border: "#E2DFEE",
      primary: "#4338CA",
      onPrimary: "#FFFFFF",
      accent: "#B45309",
      onAccent: "#FFFFFF",
      success: "#15803D",
      danger: "#B91C1C",
    },
  },
  {
    id: "ocean",
    label: "أزرق بحري",
    theme: {
      background: "#F2F7FA",
      surface: "#FFFFFF",
      text: "#0C2233",
      mutedText: "#52687A",
      border: "#D8E4EC",
      primary: "#0369A1",
      onPrimary: "#FFFFFF",
      accent: "#B45309",
      onAccent: "#FFFFFF",
      success: "#047857",
      danger: "#B91C1C",
    },
  },
  {
    id: "desert",
    label: "صحراوي",
    theme: {
      background: "#FAF8F1",
      surface: "#FFFFFF",
      text: "#2A2414",
      mutedText: "#6B634C",
      border: "#E8E2CF",
      primary: "#854D0E",
      onPrimary: "#FFFFFF",
      accent: "#1D4ED8",
      onAccent: "#FFFFFF",
      success: "#3F7D20",
      danger: "#B42318",
    },
  },
  {
    id: "charcoal",
    label: "فحمي",
    theme: {
      background: "#F5F6F7",
      surface: "#FFFFFF",
      text: "#111418",
      mutedText: "#5F656D",
      border: "#E1E4E8",
      primary: "#1F2937",
      onPrimary: "#FFFFFF",
      accent: "#0F766E",
      onAccent: "#FFFFFF",
      success: "#15803D",
      danger: "#B91C1C",
    },
  },
  {
    id: "olive",
    label: "زيتوني",
    theme: {
      background: "#F6F7F2",
      surface: "#FFFFFF",
      text: "#1E2214",
      mutedText: "#636A52",
      border: "#E2E5D7",
      primary: "#4D5B1E",
      onPrimary: "#FFFFFF",
      accent: "#9A3412",
      onAccent: "#FFFFFF",
      success: "#15803D",
      danger: "#B91C1C",
    },
  },
  {
    id: "plum",
    label: "بنفسجي",
    theme: {
      background: "#F8F5FA",
      surface: "#FFFFFF",
      text: "#24152B",
      mutedText: "#6B5A73",
      border: "#E7DEEC",
      primary: "#6B21A8",
      onPrimary: "#FFFFFF",
      accent: "#B45309",
      onAccent: "#FFFFFF",
      success: "#15803D",
      danger: "#B91C1C",
    },
  },
  {
    id: "navy-gold",
    label: "كحلي وذهبي",
    theme: {
      background: "#F4F5F8",
      surface: "#FFFFFF",
      text: "#0B1530",
      mutedText: "#565F78",
      border: "#DDE1EA",
      primary: "#14213D",
      onPrimary: "#FFFFFF",
      accent: "#A16207",
      onAccent: "#FFFFFF",
      success: "#15803D",
      danger: "#B91C1C",
    },
  },
];

/** Used for any colour the API leaves out. */
export const DEFAULT_THEME: TenantTheme = THEME_PRESETS[0].theme;

/** The preset whose colours all equal `theme`'s, ignoring letter case. */
export function findThemePreset(theme: TenantTheme): ThemePreset | undefined {
  return THEME_PRESETS.find((preset) =>
    THEME_COLORS.every(({ key }) => preset.theme[key].toLowerCase() === theme[key].toLowerCase()),
  );
}

/** Same pattern the API validates theme colours against. */
const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export const isHexColor = (value: string) => HEX_COLOR.test(value);

/**
 * The colour as "#rrggbb" for `<input type="color">`, which accepts no other form:
 * short colours are expanded and the alpha channel is dropped.
 */
export function toColorInputValue(value: string): string {
  if (!isHexColor(value)) return "#000000";
  const hex = value.slice(1);
  if (hex.length === 3) return `#${[...hex].map((c) => c + c).join("")}`.toLowerCase();
  return `#${hex.slice(0, 6)}`.toLowerCase();
}

export function withDefaults(theme: Partial<TenantTheme> | null | undefined): TenantTheme {
  return { ...DEFAULT_THEME, ...theme };
}

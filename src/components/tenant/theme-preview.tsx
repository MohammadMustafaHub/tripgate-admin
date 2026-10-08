import { CalendarDaysIcon, CircleCheckIcon, TriangleAlertIcon } from "lucide-react";
import { RemoteImage } from "@/components/remote-image";
import type { TenantTheme } from "@/models/tenant";

/** A miniature of the tenant's client site painted with `theme`, so colour choices can be judged together. */
export function ThemePreview({
  theme,
  name,
  logoUrl,
}: {
  theme: TenantTheme;
  name: string;
  logoUrl: string | null;
}) {
  return (
    <div
      aria-label="معاينة ألوان الموقع"
      className="overflow-hidden rounded-xl border shadow-xs"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <div
        className="flex items-center gap-2.5 border-b px-4 py-3"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        {logoUrl ? (
          <RemoteImage src={logoUrl} alt="" className="size-8 rounded-md bg-transparent object-contain" />
        ) : (
          <span
            className="flex size-8 items-center justify-center rounded-md text-sm font-bold"
            style={{ backgroundColor: theme.primary, color: theme.onPrimary }}
          >
            {name.trim().charAt(0) || "؟"}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{name.trim() || "اسم المؤسسة"}</span>
        <span className="text-xs" style={{ color: theme.mutedText }}>
          الرحلات
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div
          className="flex flex-col gap-3 rounded-lg border p-4"
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-sm font-semibold">رحلة إلى أربيل وشقلاوة</span>
              <span className="flex items-center gap-1 text-xs" style={{ color: theme.mutedText }}>
                <CalendarDaysIcon className="size-3.5" />
                3 أيام · تنطلق 12 تشرين الأول
              </span>
            </div>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: theme.accent, color: theme.onAccent }}
            >
              الأكثر طلباً
            </span>
          </div>
          <div className="h-px" style={{ backgroundColor: theme.border }} />
          <div className="flex items-center justify-between gap-3">
            <span className="text-base font-bold" style={{ color: theme.primary }}>
              250,000 د.ع
            </span>
            <span
              className="rounded-md px-3 py-1.5 text-xs font-medium"
              style={{ backgroundColor: theme.primary, color: theme.onPrimary }}
            >
              احجز الآن
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: theme.danger }}>
            <TriangleAlertIcon className="size-3.5" />
            بقي مقعدان فقط
          </span>
        </div>

        <div
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium"
          style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.success }}
        >
          <CircleCheckIcon className="size-4" />
          تم تأكيد حجزك بنجاح
        </div>
      </div>
    </div>
  );
}

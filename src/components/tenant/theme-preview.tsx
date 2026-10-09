import { BusIcon, CalendarDaysIcon, CircleCheckIcon, ClockIcon, HourglassIcon, ImageIcon } from "lucide-react";
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
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{ backgroundColor: theme.accent, color: theme.onAccent }}
        >
          عروض
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {/* Mirrors the client site's trip card. */}
        <div
          className="flex flex-col overflow-hidden rounded-xl border"
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        >
          <div className="relative">
            <div
              className="flex aspect-[16/10] w-full items-center justify-center"
              style={{ backgroundColor: theme.border, color: theme.mutedText }}
            >
              <ImageIcon className="size-8 opacity-60" />
            </div>
            <span
              className="absolute start-3 top-3 rounded-md px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: theme.surface, color: theme.text }}
            >
              رحلة داخلية
            </span>
          </div>

          <div className="flex flex-1 flex-col p-5">
            <h4 className="text-lg leading-snug font-bold">رحلة إلى أربيل وشقلاوة</h4>

            <dl className="mt-4 mb-5 flex flex-col gap-2.5 text-sm">
              <InfoRow theme={theme} icon={<CalendarDaysIcon className="size-4" />} label="موعد الانطلاق" value="الجمعة 16 تشرين الأول" />
              <InfoRow theme={theme} icon={<HourglassIcon className="size-4" />} label="آخر موعد للتسجيل" value="12 تشرين الأول 2026" />
              <InfoRow theme={theme} icon={<ClockIcon className="size-4" />} label="مدة الرحلة" value="3 أيام" />
              <InfoRow theme={theme} icon={<BusIcon className="size-4" />} label="وسيلة النقل" value="حافلة" />
            </dl>

            <div className="mt-auto flex items-end justify-between gap-3 border-t pt-4" style={{ borderColor: theme.border }}>
              <div>
                <p className="text-xs" style={{ color: theme.mutedText }}>
                  سعر المقعد
                </p>
                <p className="text-xl font-bold" style={{ color: theme.primary }}>
                  250,000 د.ع
                </p>
              </div>
              <p className="text-sm font-semibold" style={{ color: theme.danger }}>
                تبقّى مقعدان فقط
              </p>
            </div>
          </div>
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

function InfoRow({
  theme,
  icon,
  label,
  value,
}: {
  theme: TenantTheme;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden style={{ color: theme.mutedText }}>
        {icon}
      </span>
      <dt style={{ color: theme.mutedText }}>{label}:</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

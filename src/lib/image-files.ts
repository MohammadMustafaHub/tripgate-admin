import { formatNumber } from "@/lib/format";

/** e.g. 5 * 1024 * 1024 -> "5 ميغابايت" */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${formatNumber(Math.round((bytes / (1024 * 1024)) * 10) / 10)} ميغابايت`;
  return `${formatNumber(Math.round(bytes / 1024))} كيلوبايت`;
}

/** Splits picked files into usable images and Arabic messages for the ones that were refused. */
export function validateImageFiles(files: File[], maxSize: number) {
  const accepted: File[] = [];
  const errors: string[] = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      errors.push(`الملف "${file.name}" ليس صورة.`);
    } else if (file.size > maxSize) {
      errors.push(`حجم الصورة "${file.name}" يتجاوز الحد المسموح (${formatFileSize(maxSize)}).`);
    } else {
      accepted.push(file);
    }
  }
  return { accepted, errors };
}

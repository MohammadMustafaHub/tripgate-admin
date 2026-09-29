// Helpers for <input type="datetime-local">, which works in the browser's local time without a zone.

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO date-time -> "YYYY-MM-DDTHH:mm" in local time. */
export function toDateTimeInput(value: string | Date): string {
  const d = new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "YYYY-MM-DDTHH:mm" (local) -> ISO date-time with a time zone, or null when empty/invalid. */
export function fromDateTimeInput(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

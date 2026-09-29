const PUBLIC_IMAGES_URL = import.meta.env.VITE_PUBLIC_IMAGES_URL;
if (!PUBLIC_IMAGES_URL) {
  throw new Error("VITE_PUBLIC_IMAGES_URL is not defined");
}

const BASE_URL = PUBLIC_IMAGES_URL.replace(/\/+$/, "");

/** Public URL for an image storage key. Values that are already absolute URLs pass through. */
export function imageUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (/^https?:\/\//i.test(key)) return key;
  return `${BASE_URL}/${key.replace(/^\/+/, "")}`;
}

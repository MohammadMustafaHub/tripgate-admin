/** The only shape the API accepts: 9647 followed by 9 digits. */
const API_PHONE_PATTERN = /^9647\d{9}$/;

/**
 * Normalises the ways an Iraqi mobile number is commonly written into the form
 * the API expects.
 *
 *   7XXXXXXXXX      →  9647XXXXXXXXX
 *   07XXXXXXXXX     →  9647XXXXXXXXX
 *   9647XXXXXXXXX   →  9647XXXXXXXXX
 *
 * Separators and a leading + or 00 are ignored. Returns null when the digits
 * cannot make a valid number.
 */
export function normalizeIraqiPhone(input: string): string | null {
  const digits = input.replace(/\D/g, '').replace(/^00/, '');

  let national: string;
  if (digits.startsWith('964')) {
    national = digits.slice(3);
  } else if (digits.startsWith('0')) {
    national = digits.slice(1);
  } else {
    national = digits;
  }

  const candidate = `964${national}`;
  return API_PHONE_PATTERN.test(candidate) ? candidate : null;
}

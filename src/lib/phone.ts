const IRAQI_MOBILE = /^7\d{9}$/;

// Accepts 07XXXXXXXXX, 7XXXXXXXXX, +9647XXXXXXXXX or 009647XXXXXXXXX and returns
// the 9647XXXXXXXXX form the API expects, or null when the number is not valid.
export function toApiPhoneNumber(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("964")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return IRAQI_MOBILE.test(digits) ? `964${digits}` : null;
}

// 9647XXXXXXXXX -> 07XX XXX XXXX
export function formatPhoneNumber(phoneNumber: string): string {
  const local = "0" + phoneNumber.replace(/^964/, "");
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

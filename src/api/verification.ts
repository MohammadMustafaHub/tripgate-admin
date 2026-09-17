import { fail, ok, type Result } from '@/lib/result';
import { client, httpStatus } from './client';

export type SendVerificationCodeError =
  | 'ALREADY_CONFIRMED'
  | 'SMS_RATE_LIMITED'
  | 'UNAUTHORIZED'
  | 'NETWORK'
  | 'UNEXPECTED';

/** Sends a six digit code to the signed-in account's phone number. */
export async function sendVerificationCode(): Promise<
  Result<void, SendVerificationCodeError>
> {
  try {
    await client.post('/api/auth/Verification/send-code');
    return ok(undefined);
  } catch (error) {
    switch (httpStatus(error)) {
      case 401:
        return fail('UNAUTHORIZED');
      case 409:
        return fail('ALREADY_CONFIRMED');
      case 429:
        return fail('SMS_RATE_LIMITED');
      case null:
        return fail('NETWORK');
      default:
        return fail('UNEXPECTED');
    }
  }
}

/** The verification code sent to the account's phone number. */
export interface VerifyCodeRequest {
  /** Six digit verification code. */
  code: string;
}

export type VerifyPhoneError =
  | 'INVALID_OR_EXPIRED_CODE'
  | 'UNAUTHORIZED'
  | 'NETWORK'
  | 'UNEXPECTED';

/** Confirms the account's phone number with the code that was sent to it. */
export async function verifyPhone(
  request: VerifyCodeRequest
): Promise<Result<void, VerifyPhoneError>> {
  try {
    await client.post('/api/auth/Verification/verify', request);
    return ok(undefined);
  } catch (error) {
    switch (httpStatus(error)) {
      case 400:
        return fail('INVALID_OR_EXPIRED_CODE');
      case 401:
        return fail('UNAUTHORIZED');
      case null:
        return fail('NETWORK');
      default:
        return fail('UNEXPECTED');
    }
  }
}

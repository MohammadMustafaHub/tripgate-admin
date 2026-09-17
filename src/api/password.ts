import { fail, ok, type Result } from '@/lib/result';
import {
  passwordResetTokenSchema,
  type PasswordResetToken,
} from '@/models/password-reset-token';
import { client, httpStatus } from './client';
import { parseSuccess } from './responses';

/** Changes the password of the signed in account. */
export interface ChangePasswordRequest {
  /** The password currently on the account. */
  currentPassword: string;
  /** The replacement password. Must be at least 8 characters. */
  newPassword: string;
}

export type ChangePasswordError =
  | 'REJECTED'
  | 'UNAUTHORIZED'
  | 'NETWORK'
  | 'UNEXPECTED';

/**
 * REJECTED covers both halves of the API's single 400: the current password
 * was wrong, or the new one failed the password policy.
 */
export async function changePassword(
  request: ChangePasswordRequest
): Promise<Result<void, ChangePasswordError>> {
  try {
    await client.post('/api/auth/Password/change', request);
    return ok(undefined);
  } catch (error) {
    switch (httpStatus(error)) {
      case 400:
        return fail('REJECTED');
      case 401:
        return fail('UNAUTHORIZED');
      case null:
        return fail('NETWORK');
      default:
        return fail('UNEXPECTED');
    }
  }
}

/** Starts the forgot password flow for a phone number. */
export interface ForgotPasswordRequest {
  /** Iraqi phone number in the format 9647XXXXXXXXX. */
  phoneNumber: string;
}

export type ForgotPasswordError = 'SMS_RATE_LIMITED' | 'NETWORK' | 'UNEXPECTED';

/**
 * Sends a six digit code by SMS. Succeeds whether or not the number belongs to
 * an account, so it cannot be used to probe for registered numbers.
 */
export async function forgotPassword(
  request: ForgotPasswordRequest
): Promise<Result<void, ForgotPasswordError>> {
  try {
    await client.post('/api/auth/Password/forgot', request, {
      skipAuthRefresh: true,
    });
    return ok(undefined);
  } catch (error) {
    switch (httpStatus(error)) {
      case 429:
        return fail('SMS_RATE_LIMITED');
      case null:
        return fail('NETWORK');
      default:
        return fail('UNEXPECTED');
    }
  }
}

/** Exchanges a verification code for a password reset token. */
export interface VerifyPasswordCodeRequest {
  /** Iraqi phone number in the format 9647XXXXXXXXX. */
  phoneNumber: string;
  /** Six digit code sent to the phone number. */
  code: string;
}

export type VerifyPasswordCodeError =
  | 'INVALID_OR_EXPIRED_CODE'
  | 'NETWORK'
  | 'UNEXPECTED';

export async function verifyPasswordCode(
  request: VerifyPasswordCodeRequest
): Promise<Result<PasswordResetToken, VerifyPasswordCodeError>> {
  try {
    const response = await client.post(
      '/api/auth/Password/verify-code',
      request,
      { skipAuthRefresh: true }
    );

    const token = parseSuccess(response.data, passwordResetTokenSchema);
    return token ? ok(token) : fail('UNEXPECTED');
  } catch (error) {
    switch (httpStatus(error)) {
      case 400:
        return fail('INVALID_OR_EXPIRED_CODE');
      case null:
        return fail('NETWORK');
      default:
        return fail('UNEXPECTED');
    }
  }
}

/** Sets a new password using a password reset token. */
export interface ResetPasswordRequest {
  /** Iraqi phone number in the format 9647XXXXXXXXX. */
  phoneNumber: string;
  /** Reset token returned by the verify code step. */
  token: string;
  /** The replacement password. Must be at least 8 characters. */
  newPassword: string;
}

export type ResetPasswordError = 'REJECTED' | 'NETWORK' | 'UNEXPECTED';

/**
 * REJECTED covers both halves of the API's single 400: the reset token is
 * invalid or already spent, or the new password failed the password policy.
 */
export async function resetPassword(
  request: ResetPasswordRequest
): Promise<Result<void, ResetPasswordError>> {
  try {
    await client.post('/api/auth/Password/reset', request, {
      skipAuthRefresh: true,
    });
    return ok(undefined);
  } catch (error) {
    switch (httpStatus(error)) {
      case 400:
        return fail('REJECTED');
      case null:
        return fail('NETWORK');
      default:
        return fail('UNEXPECTED');
    }
  }
}

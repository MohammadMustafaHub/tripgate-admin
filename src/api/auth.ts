import { fail, ok, type Result } from '@/lib/result';
import { authTokensSchema, type AuthTokens } from '@/models/auth-tokens';
import {
  client,
  clearTokens,
  getRefreshToken,
  httpStatus,
  setTokens,
} from './client';
import { parseSuccess } from './responses';
import { revokeToken } from './tokens';

/** Credentials for creating a new account. */
export interface RegisterRequest {
  /** Iraqi phone number in the format 9647XXXXXXXXX. */
  phoneNumber: string;
  /** Account password. Must be at least 8 characters. */
  password: string;
}

export type RegisterError = 'PHONE_ALREADY_REGISTERED' | 'NETWORK' | 'UNEXPECTED';

export async function register(
  request: RegisterRequest
): Promise<Result<AuthTokens, RegisterError>> {
  try {
    const response = await client.post('/api/auth/register', request, {
      skipAuthRefresh: true,
    });

    const tokens = parseSuccess(response.data, authTokensSchema);
    if (!tokens) return fail('UNEXPECTED');

    setTokens(tokens);
    return ok(tokens);
  } catch (error) {
    switch (httpStatus(error)) {
      case 409:
        return fail('PHONE_ALREADY_REGISTERED');
      case null:
        return fail('NETWORK');
      default:
        return fail('UNEXPECTED');
    }
  }
}

/** Credentials for signing in to an existing account. */
export interface LoginRequest {
  /** Iraqi phone number in the format 9647XXXXXXXXX. */
  phoneNumber: string;
  password: string;
}

export type LoginError =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'NETWORK'
  | 'UNEXPECTED';

export async function login(
  request: LoginRequest
): Promise<Result<AuthTokens, LoginError>> {
  try {
    const response = await client.post('/api/auth/login', request, {
      skipAuthRefresh: true,
    });

    const tokens = parseSuccess(response.data, authTokensSchema);
    if (!tokens) return fail('UNEXPECTED');

    setTokens(tokens);
    return ok(tokens);
  } catch (error) {
    switch (httpStatus(error)) {
      case 401:
        return fail('INVALID_CREDENTIALS');
      case 423:
        return fail('ACCOUNT_LOCKED');
      case null:
        return fail('NETWORK');
      default:
        return fail('UNEXPECTED');
    }
  }
}

export type LogoutError = 'NETWORK' | 'UNEXPECTED';

/**
 * Revokes the stored refresh token server-side. The local tokens are dropped
 * either way — a failed revoke should not leave the client signed in.
 */
export async function logout(): Promise<Result<void, LogoutError>> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    return ok(undefined);
  }

  const result = await revokeToken({ refreshToken });
  clearTokens();

  // A token the server has never heard of is already revoked, as far as
  // signing out is concerned.
  if (result.ok || result.error === 'NOT_FOUND') return ok(undefined);

  return fail<LogoutError>(
    result.error === 'NETWORK' ? 'NETWORK' : 'UNEXPECTED'
  );
}

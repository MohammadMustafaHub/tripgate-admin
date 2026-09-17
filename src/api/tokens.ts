import { fail, ok, type Result } from '@/lib/result';
import { authTokensSchema, type AuthTokens } from '@/models/auth-tokens';
import { client, httpStatus, setTokens } from './client';
import { parseSuccess } from './responses';

/** Carries a refresh token issued by register, login or refresh. */
export interface RefreshTokenRequest {
  /** The refresh token to act on. */
  refreshToken: string;
}

export type RefreshTokensError =
  | 'INVALID_REFRESH_TOKEN'
  | 'NETWORK'
  | 'UNEXPECTED';

/**
 * Exchanges a refresh token for a new pair. The client's refresh interceptor
 * does this on its own for 401s — this is the endpoint for calling it directly.
 */
export async function refreshTokens(
  request: RefreshTokenRequest
): Promise<Result<AuthTokens, RefreshTokensError>> {
  try {
    const response = await client.post('/api/auth/Tokens/refresh', request, {
      skipAuthRefresh: true,
    });

    const tokens = parseSuccess(response.data, authTokensSchema);
    if (!tokens) return fail('UNEXPECTED');

    setTokens(tokens);
    return ok(tokens);
  } catch (error) {
    switch (httpStatus(error)) {
      case 401:
        return fail('INVALID_REFRESH_TOKEN');
      case null:
        return fail('NETWORK');
      default:
        return fail('UNEXPECTED');
    }
  }
}

export type RevokeTokenError = 'NOT_FOUND' | 'NETWORK' | 'UNEXPECTED';

/** Revokes a single refresh token, ending that one session. */
export async function revokeToken(
  request: RefreshTokenRequest
): Promise<Result<void, RevokeTokenError>> {
  try {
    await client.post('/api/auth/Tokens/revoke', request, {
      skipAuthRefresh: true,
    });
    return ok(undefined);
  } catch (error) {
    switch (httpStatus(error)) {
      case 404:
        return fail('NOT_FOUND');
      case null:
        return fail('NETWORK');
      default:
        return fail('UNEXPECTED');
    }
  }
}

export type RevokeAllTokensError = 'UNAUTHORIZED' | 'NETWORK' | 'UNEXPECTED';

/** Revokes every refresh token for the account, signing out all devices. */
export async function revokeAllTokens(): Promise<
  Result<void, RevokeAllTokensError>
> {
  try {
    await client.post('/api/auth/Tokens/revoke-all');
    return ok(undefined);
  } catch (error) {
    switch (httpStatus(error)) {
      case 401:
        return fail('UNAUTHORIZED');
      case null:
        return fail('NETWORK');
      default:
        return fail('UNEXPECTED');
    }
  }
}

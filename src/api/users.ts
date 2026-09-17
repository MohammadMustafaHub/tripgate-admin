import { fail, ok, type Result } from '@/lib/result';
import { userSchema, type User } from '@/models/user';
import { client, httpStatus } from './client';
import { parseSuccess } from './responses';

export type GetCurrentUserError = 'UNAUTHORIZED' | 'NETWORK' | 'UNEXPECTED';

/** The account behind the stored access token. */
export async function getCurrentUser(): Promise<
  Result<User, GetCurrentUserError>
> {
  try {
    const response = await client.get('/api/auth/Users/me');

    const user = parseSuccess(response.data, userSchema);
    return user ? ok(user) : fail('UNEXPECTED');
  } catch (error) {
    switch (httpStatus(error)) {
      // Reached only once the refresh interceptor has given up.
      case 401:
        return fail('UNAUTHORIZED');
      case null:
        return fail('NETWORK');
      default:
        return fail('UNEXPECTED');
    }
  }
}

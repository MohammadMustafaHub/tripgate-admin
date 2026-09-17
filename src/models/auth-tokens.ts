import { z } from 'zod';

/** The token pair issued to a signed-in client. */
export interface AuthTokens {
  /** Short-lived bearer token for calling the API. */
  accessToken: string;
  /** Long-lived token used to obtain a new access token. Shown once. */
  refreshToken: string;
}

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

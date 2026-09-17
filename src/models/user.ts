import { z } from 'zod';

/** The signed-in user's account details. */
export interface User {
  /** Identifier of the user. */
  id: string;
  /** Iraqi phone number the account is registered under. */
  phoneNumber: string;
  /** Whether the phone number is confirmed. */
  phoneNumberConfirmed: boolean;
  /** Role names held by the user. */
  roles: string[];
}

export const userSchema = z.object({
  id: z.string(),
  phoneNumber: z.string(),
  phoneNumberConfirmed: z.boolean(),
  roles: z.array(z.string()),
});

import { z } from 'zod';

/** Proof of phone number ownership, spent by the reset password step. */
export interface PasswordResetToken {
  /** Identity password reset token. */
  token: string;
}

export const passwordResetTokenSchema = z.object({
  token: z.string(),
});

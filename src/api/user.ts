import type { AxiosError } from "axios";
import { fail, ok, type Result } from "@/lib/result";
import type { User } from "@/models/user";
import client from "./client";
import type { SuccessResponse } from "./responses";
import { tokenStorage } from "./tokens-storage";

export type GetCurrentUserError = "UNAUTHORIZED" | "UNKNOWN_ERROR";

export async function getCurrentUser(): Promise<Result<User, GetCurrentUserError>> {
  try {
    const response = await client.get<SuccessResponse<User>>("/auth/Users/me");
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    // A failed refresh clears the tokens, so their absence also means the session is gone.
    if (status === 401 || !tokenStorage.getRefreshToken()) return fail("UNAUTHORIZED");
    return fail("UNKNOWN_ERROR");
  }
}

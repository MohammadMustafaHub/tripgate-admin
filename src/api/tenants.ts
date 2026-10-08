import type { AxiosError } from "axios";
import { fail, ok, type Result } from "@/lib/result";
import type { Tokens } from "@/models/auth";
import type { Tenant, TenantTheme } from "@/models/tenant";
import client from "./client";
import type { SuccessResponse } from "./responses";

export type CreateTenantError = "TENANT_CONFLICT" | "UNKNOWN_ERROR";

// Returns a new token pair whose access token carries the tenant claim.
export async function createTenant({
  name,
  subdomain,
}: {
  name: string;
  subdomain: string;
}): Promise<Result<Tokens, CreateTenantError>> {
  try {
    const response = await client.post<SuccessResponse<Tokens>>(
      "/tenancy/Tenants",
      { name, subdomain },
    );
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 409) return fail("TENANT_CONFLICT");
    return fail("UNKNOWN_ERROR");
  }
}

export type GetCurrentTenantError = "NO_TENANT" | "UNKNOWN_ERROR";

export async function getCurrentTenant(): Promise<Result<Tenant, GetCurrentTenantError>> {
  try {
    const response = await client.get<SuccessResponse<Tenant>>("/tenancy/Tenants/current");
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return fail("NO_TENANT");
    return fail("UNKNOWN_ERROR");
  }
}

export type UpdateTenantError = "INVALID_TENANT" | "NOT_FOUND" | "UNKNOWN_ERROR";

// The subdomain cannot be changed.
export async function updateTenant(tenant: {
  /** At most 200 characters. */
  name: string;
  /** Public URL of the logo, e.g. from the media upload endpoint; null removes it. */
  logoUrl: string | null;
  theme: TenantTheme;
}): Promise<Result<Tenant, UpdateTenantError>> {
  try {
    const response = await client.put<SuccessResponse<Tenant>>("/tenancy/Tenants/current", tenant);
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 400) return fail("INVALID_TENANT");
    if (status === 404) return fail("NOT_FOUND");
    return fail("UNKNOWN_ERROR");
  }
}

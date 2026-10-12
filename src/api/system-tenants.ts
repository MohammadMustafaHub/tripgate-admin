import type { AxiosError } from "axios";
import { fail, ok, type Result } from "@/lib/result";
import type { SubscriptionPlan, SystemTenant } from "@/models/tenant";
import client from "./client";
import type { PaginatedResponse, SuccessResponse } from "./responses";

export type ListSystemTenantsError = "UNKNOWN_ERROR";

export async function listSystemTenants({
  page,
  pageSize,
  search,
}: {
  page: number;
  /** At most 100. */
  pageSize: number;
  /** Matches names containing this text, ignoring case, or exactly this subdomain. */
  search?: string;
}): Promise<Result<PaginatedResponse<SystemTenant>, ListSystemTenantsError>> {
  try {
    const response = await client.get<PaginatedResponse<SystemTenant>>("/system/tenants", {
      params: { Page: page, PageSize: pageSize, Search: search || undefined },
    });
    return ok(response.data);
  } catch {
    return fail("UNKNOWN_ERROR");
  }
}

export type GetSystemTenantError = "NOT_FOUND" | "UNKNOWN_ERROR";

export async function getSystemTenant({ id }: { id: string }): Promise<Result<SystemTenant, GetSystemTenantError>> {
  try {
    const response = await client.get<SuccessResponse<SystemTenant>>(`/system/tenants/${id}`);
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return fail("NOT_FOUND");
    return fail("UNKNOWN_ERROR");
  }
}

export type UpdateSystemTenantError = "NOT_FOUND" | "UNKNOWN_ERROR";

/** The tenant's current plan, while still active, is extended from its expiry; any other plan starts a new period today. */
export async function updateTenantSubscription({
  id,
  plan,
}: {
  id: string;
  plan: SubscriptionPlan;
}): Promise<Result<SystemTenant, UpdateSystemTenantError>> {
  try {
    const response = await client.put<SuccessResponse<SystemTenant>>(`/system/tenants/${id}/subscription`, { plan });
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return fail("NOT_FOUND");
    return fail("UNKNOWN_ERROR");
  }
}

/** A null limit uses the plan's value; all null clears the overrides. */
export async function updateTenantLimits({
  id,
  ...limits
}: {
  id: string;
  maxTripsPerMonth: number | null;
  maxActiveTrips: number | null;
  maxUsers: number | null;
}): Promise<Result<SystemTenant, UpdateSystemTenantError>> {
  try {
    const response = await client.put<SuccessResponse<SystemTenant>>(`/system/tenants/${id}/limits`, limits);
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return fail("NOT_FOUND");
    return fail("UNKNOWN_ERROR");
  }
}

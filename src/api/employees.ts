import type { AxiosError } from "axios";
import { fail, ok, type Result } from "@/lib/result";
import type { Employee } from "@/models/employee";
import client from "./client";
import type { PaginatedResponse, SuccessResponse } from "./responses";

export type ListEmployeesError = "UNKNOWN_ERROR";

export async function listEmployees({
  page,
  pageSize,
}: {
  page: number;
  /** At most 100. */
  pageSize: number;
}): Promise<Result<PaginatedResponse<Employee>, ListEmployeesError>> {
  try {
    const response = await client.get<PaginatedResponse<Employee>>("/Employees", {
      params: { Page: page, PageSize: pageSize },
    });
    return ok(response.data);
  } catch {
    return fail("UNKNOWN_ERROR");
  }
}

/** PHONE_TAKEN: the phone number is already registered. */
export type CreateEmployeeError = "INVALID_EMPLOYEE" | "PHONE_TAKEN" | "UNKNOWN_ERROR";

export async function createEmployee(employee: {
  /** Iraqi phone number in the format 9647XXXXXXXXX; also the employee's login. */
  phoneNumber: string;
  /** Initial password, at least 8 characters. */
  password: string;
  roles: string[];
}): Promise<Result<Employee, CreateEmployeeError>> {
  try {
    const response = await client.post<SuccessResponse<Employee>>("/Employees", employee);
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 400) return fail("INVALID_EMPLOYEE");
    if (status === 409) return fail("PHONE_TAKEN");
    return fail("UNKNOWN_ERROR");
  }
}

/** IS_TENANT_ADMIN: the tenant admin cannot be removed. */
export type RemoveEmployeeError = "INVALID_EMPLOYEE" | "NOT_FOUND" | "IS_TENANT_ADMIN" | "UNKNOWN_ERROR";

export async function removeEmployee({ id }: { id: string }): Promise<Result<void, RemoveEmployeeError>> {
  try {
    await client.delete(`/Employees/${id}`);
    return ok(undefined);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 400) return fail("INVALID_EMPLOYEE");
    if (status === 404) return fail("NOT_FOUND");
    if (status === 409) return fail("IS_TENANT_ADMIN");
    return fail("UNKNOWN_ERROR");
  }
}

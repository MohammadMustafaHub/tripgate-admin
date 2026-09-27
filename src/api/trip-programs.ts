import type { AxiosError } from "axios";
import { fail, ok, type Result } from "@/lib/result";
import type { TripProgram, TripStep } from "@/models/trip-program";
import client from "./client";
import type { PaginatedResponse, SuccessResponse } from "./responses";

export type ListTripProgramsError = "UNKNOWN_ERROR";

export async function listTripPrograms({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}): Promise<Result<PaginatedResponse<TripProgram>, ListTripProgramsError>> {
  try {
    const response = await client.get<PaginatedResponse<TripProgram>>(
      "/trips/TripPrograms",
      { params: { Page: page, PageSize: pageSize } },
    );
    return ok(response.data);
  } catch {
    return fail("UNKNOWN_ERROR");
  }
}

export type GetTripProgramError = "NOT_FOUND" | "UNKNOWN_ERROR";

export async function getTripProgram({
  id,
}: {
  id: string;
}): Promise<Result<TripProgram, GetTripProgramError>> {
  try {
    const response = await client.get<SuccessResponse<TripProgram>>(
      `/trips/TripPrograms/${id}`,
    );
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return fail("NOT_FOUND");
    return fail("UNKNOWN_ERROR");
  }
}

export type CreateTripProgramError = "UNKNOWN_ERROR";

export async function createTripProgram(program: {
  name: string;
  description: string;
  defaultPricePerSeat: number;
  defaultSeats: number;
  coverImage: string;
  transportMethod: string;
  isInternational: boolean;
  steps: TripStep[];
  images: string[];
}): Promise<Result<TripProgram, CreateTripProgramError>> {
  try {
    const response = await client.post<SuccessResponse<TripProgram>>(
      "/trips/TripPrograms",
      program,
    );
    return ok(response.data.data);
  } catch {
    return fail("UNKNOWN_ERROR");
  }
}

export type UpdateTripProgramError = "NOT_FOUND" | "UNKNOWN_ERROR";

export async function updateTripProgram({
  id,
  ...program
}: Parameters<typeof createTripProgram>[0] & {
  id: string;
}): Promise<Result<TripProgram, UpdateTripProgramError>> {
  try {
    const response = await client.put<SuccessResponse<TripProgram>>(
      `/trips/TripPrograms/${id}`,
      program,
    );
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return fail("NOT_FOUND");
    return fail("UNKNOWN_ERROR");
  }
}

export type DeleteTripProgramError = "NOT_FOUND" | "HAS_SCHEDULED_TRIPS" | "UNKNOWN_ERROR";

export async function deleteTripProgram({
  id,
}: {
  id: string;
}): Promise<Result<void, DeleteTripProgramError>> {
  try {
    await client.delete(`/trips/TripPrograms/${id}`);
    return ok(undefined);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return fail("NOT_FOUND");
    if (status === 409) return fail("HAS_SCHEDULED_TRIPS");
    return fail("UNKNOWN_ERROR");
  }
}

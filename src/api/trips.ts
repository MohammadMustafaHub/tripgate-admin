import type { AxiosError } from "axios";
import { fail, ok, type Result } from "@/lib/result";
import type { Trip, TripDetails } from "@/models/trip";
import client from "./client";
import type { PaginatedResponse, SuccessResponse } from "./responses";

export type ListTripsError = "UNKNOWN_ERROR";

export async function listTrips({
  page,
  pageSize,
  tripProgramId,
  isActive,
}: {
  page: number;
  pageSize: number;
  tripProgramId?: string;
  isActive?: boolean;
}): Promise<Result<PaginatedResponse<Trip>, ListTripsError>> {
  try {
    const response = await client.get<PaginatedResponse<Trip>>("/trips/Trips", {
      params: { Page: page, PageSize: pageSize, TripProgramId: tripProgramId, IsActive: isActive },
    });
    return ok(response.data);
  } catch {
    return fail("UNKNOWN_ERROR");
  }
}

export type GetTripError = "NOT_FOUND" | "UNKNOWN_ERROR";

export async function getTrip({ id }: { id: string }): Promise<Result<TripDetails, GetTripError>> {
  try {
    const response = await client.get<SuccessResponse<TripDetails>>(`/trips/Trips/${id}`);
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return fail("NOT_FOUND");
    return fail("UNKNOWN_ERROR");
  }
}

export type CreateTripError = "PROGRAM_NOT_FOUND" | "UNKNOWN_ERROR";

export async function createTrip(trip: {
  tripProgramId: string;
  /** ISO date-time including a time zone. */
  takeoffDate: string;
  /** ISO date-time including a time zone; must not be after `takeoffDate`. */
  finalRegistrationDate: string;
  /** Defaults to the program's price when omitted. */
  pricePerSeat?: number | null;
  /** Defaults to the program's seat count when omitted. */
  seats?: number | null;
}): Promise<Result<Trip, CreateTripError>> {
  try {
    const response = await client.post<SuccessResponse<Trip>>("/trips/Trips", trip);
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return fail("PROGRAM_NOT_FOUND");
    return fail("UNKNOWN_ERROR");
  }
}

/** CONFLICT: the new seat count is below the seats already reserved, or the trip changed while updating. */
export type UpdateTripError = "NOT_FOUND" | "CONFLICT" | "UNKNOWN_ERROR";

export async function updateTrip({
  id,
  ...trip
}: {
  id: string;
  takeoffDate: string;
  finalRegistrationDate: string;
  pricePerSeat: number;
  /** Cannot drop below the seats already reserved. */
  seats: number;
}): Promise<Result<Trip, UpdateTripError>> {
  try {
    const response = await client.put<SuccessResponse<Trip>>(`/trips/Trips/${id}`, trip);
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return fail("NOT_FOUND");
    if (status === 409) return fail("CONFLICT");
    return fail("UNKNOWN_ERROR");
  }
}

/** CONFLICT: the trip has bookings (deactivate it instead), or it changed while deleting. */
export type DeleteTripError = "NOT_FOUND" | "CONFLICT" | "UNKNOWN_ERROR";

export async function deleteTrip({ id }: { id: string }): Promise<Result<void, DeleteTripError>> {
  try {
    await client.delete(`/trips/Trips/${id}`);
    return ok(undefined);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return fail("NOT_FOUND");
    if (status === 409) return fail("CONFLICT");
    return fail("UNKNOWN_ERROR");
  }
}

/** TRIP_CHANGED: the trip changed while updating. */
export type SetTripActiveError = "NOT_FOUND" | "TRIP_CHANGED" | "UNKNOWN_ERROR";

export async function activateTrip({ id }: { id: string }): Promise<Result<Trip, SetTripActiveError>> {
  try {
    const response = await client.post<SuccessResponse<Trip>>(`/trips/Trips/${id}/activate`);
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return fail("NOT_FOUND");
    if (status === 409) return fail("TRIP_CHANGED");
    return fail("UNKNOWN_ERROR");
  }
}

export async function deactivateTrip({ id }: { id: string }): Promise<Result<Trip, SetTripActiveError>> {
  try {
    const response = await client.post<SuccessResponse<Trip>>(`/trips/Trips/${id}/deactivate`);
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return fail("NOT_FOUND");
    if (status === 409) return fail("TRIP_CHANGED");
    return fail("UNKNOWN_ERROR");
  }
}

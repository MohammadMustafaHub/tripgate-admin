import type { AxiosError } from "axios";
import { fail, ok, type Result } from "@/lib/result";
import type { Booking, BookingListItem, BookingStatus } from "@/models/booking";
import client from "./client";
import type { PaginatedResponse, SuccessResponse } from "./responses";

export type ListAllBookingsError = "UNKNOWN_ERROR";

/** Bookings across all of the tenant's trips. */
export async function listAllBookings({
  status,
  page,
  pageSize,
}: {
  /** Only list bookings in this status. */
  status?: BookingStatus;
  page: number;
  pageSize: number;
}): Promise<Result<PaginatedResponse<BookingListItem>, ListAllBookingsError>> {
  try {
    const response = await client.get<PaginatedResponse<BookingListItem>>("/trips/Bookings", {
      params: { Status: status, Page: page, PageSize: pageSize },
    });
    return ok(response.data);
  } catch {
    return fail("UNKNOWN_ERROR");
  }
}

export type ListBookingsError = "TRIP_NOT_FOUND" | "UNKNOWN_ERROR";

export async function listBookings({
  tripId,
  status,
  page,
  pageSize,
}: {
  tripId: string;
  /** Only list bookings in this status. */
  status?: BookingStatus;
  page: number;
  pageSize: number;
}): Promise<Result<PaginatedResponse<BookingListItem>, ListBookingsError>> {
  try {
    const response = await client.get<PaginatedResponse<BookingListItem>>(`/trips/trips/${tripId}/bookings`, {
      params: { Status: status, Page: page, PageSize: pageSize },
    });
    return ok(response.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return fail("TRIP_NOT_FOUND");
    return fail("UNKNOWN_ERROR");
  }
}

/** BOOKING_UNAVAILABLE: the trip is closed for booking, has too few seats left, or changed while booking. */
export type CreateBookingError = "INVALID_BOOKING" | "TRIP_NOT_FOUND" | "BOOKING_UNAVAILABLE" | "UNKNOWN_ERROR";

export async function createBooking({
  tripId,
  ...booking
}: {
  tripId: string;
  customerName: string;
  /** Iraqi phone number in the format 9647XXXXXXXXX. */
  phoneNumber: string;
  seats: number;
  /** One per seat; required for international trips and ignored otherwise. */
  passports?: { ownerName: string; number: string }[] | null;
}): Promise<Result<Booking, CreateBookingError>> {
  try {
    const response = await client.post<SuccessResponse<Booking>>(`/trips/trips/${tripId}/bookings`, booking);
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 400) return fail("INVALID_BOOKING");
    if (status === 404) return fail("TRIP_NOT_FOUND");
    if (status === 409) return fail("BOOKING_UNAVAILABLE");
    return fail("UNKNOWN_ERROR");
  }
}

export type GetBookingError = "NOT_FOUND" | "UNKNOWN_ERROR";

export async function getBooking({
  tripId,
  bookingId,
}: {
  tripId: string;
  bookingId: string;
}): Promise<Result<Booking, GetBookingError>> {
  try {
    const response = await client.get<SuccessResponse<Booking>>(`/trips/trips/${tripId}/bookings/${bookingId}`);
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return fail("NOT_FOUND");
    return fail("UNKNOWN_ERROR");
  }
}

/** INVALID_TRANSITION: the booking cannot move to that status, or the trip changed while updating. */
export type UpdateBookingStatusError = "NOT_FOUND" | "INVALID_TRANSITION" | "UNKNOWN_ERROR";

export async function updateBookingStatus({
  tripId,
  bookingId,
  status,
}: {
  tripId: string;
  bookingId: string;
  /** Confirmed (pending bookings only) or Cancelled (releases the seats). */
  status: BookingStatus;
}): Promise<Result<Booking, UpdateBookingStatusError>> {
  try {
    const response = await client.put<SuccessResponse<Booking>>(
      `/trips/trips/${tripId}/bookings/${bookingId}/status`,
      { status },
    );
    return ok(response.data.data);
  } catch (error) {
    const code = (error as AxiosError)?.response?.status;
    if (code === 404) return fail("NOT_FOUND");
    if (code === 409) return fail("INVALID_TRANSITION");
    return fail("UNKNOWN_ERROR");
  }
}

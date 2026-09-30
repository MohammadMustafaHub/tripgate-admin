import type { Booking } from "./booking";

export interface Trip {
  id: string;
  tripProgramId: string;
  tripProgramName: string;
  takeoffDate: string;
  finalRegistrationDate: string;
  pricePerSeat: number;
  seats: number;
  reservedSeats: number;
  availableSeats: number;
  isInternational: boolean;
  isActive: boolean;
  isOpenForBooking: boolean;
  createdAt: string;
}

/** A trip with its customers' bookings, oldest first; cancelled ones are kept for history. */
export interface TripDetails extends Trip {
  bookings: Booking[];
}

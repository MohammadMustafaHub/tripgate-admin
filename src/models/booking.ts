/** Mirrors the API's numeric BookingStatus. */
export const BookingStatus = {
  Pending: 0,
  Confirmed: 1,
  Cancelled: 2,
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export interface Passport {
  ownerName: string;
  number: string;
}

export interface Booking {
  id: string;
  customerName: string;
  phoneNumber: string;
  reservedSeats: number;
  status: BookingStatus;
  cancelledAt: string | null;
  /** One per seat; empty for domestic trips. */
  passports: Passport[];
  createdAt: string;
}

/** A booking as returned by the bookings list, with the trip it is on. */
export interface BookingListItem extends Booking {
  tripId: string;
  tripName: string;
  takeoffDate: string;
}

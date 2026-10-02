/** Current number of trips by state. */
export interface TripCounts {
  /** On sale and not departed yet. */
  activeTrips: number;
  /** Taken off sale and not departed yet. */
  stoppedTrips: number;
  /** Takeoff date has passed. */
  completedTrips: number;
}

/** Earnings from trips taking off within a time frame. */
export interface Earnings {
  from: string;
  to: string;
  /** Confirmed bookings on trips that have already taken off. */
  earned: number;
  /** Confirmed bookings on trips that have not taken off yet. */
  upcomingConfirmed: number;
  /** Pending bookings on trips that have not taken off yet. */
  upcomingPending: number;
  /** Earned plus upcoming confirmed and pending. */
  projected: number;
}

/** Earnings from trips taking off within one period of the timeline. */
export interface EarningsPeriod {
  periodStart: string;
  earned: number;
  projected: number;
}

/** Earnings of one trip program within a time frame. */
export interface ProgramEarnings {
  tripProgramId: string;
  name: string;
  earned: number;
  projected: number;
  /** Seats held by pending and confirmed bookings. */
  bookedSeats: number;
}

/**
 * Timeline period size. The spec types it as an integer described as "Day, Week (starting
 * Monday) or Month"; these values assume the backend enum's declaration order.
 */
export const EarningsInterval = {
  Day: 0,
  Week: 1,
  Month: 2,
} as const;

export type EarningsInterval = (typeof EarningsInterval)[keyof typeof EarningsInterval];

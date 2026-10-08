import type { Trip } from "@/models/trip";

/** Whether the trip's departure time has passed. Also takes bookings, which carry their trip's takeoff date. */
export function hasDeparted(trip: Pick<Trip, "takeoffDate">): boolean {
  return new Date(trip.takeoffDate).getTime() < Date.now();
}

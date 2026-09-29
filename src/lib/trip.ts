import type { Trip } from "@/models/trip";

/** Whether the trip's departure time has passed. */
export function hasDeparted(trip: Trip): boolean {
  return new Date(trip.takeoffDate).getTime() < Date.now();
}

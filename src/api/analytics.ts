import { fail, ok, type Result } from "@/lib/result";
import type {
  Earnings,
  EarningsInterval,
  EarningsPeriod,
  ProgramEarnings,
  TripCounts,
} from "@/models/analytics";
import client from "./client";
import type { SuccessResponse } from "./responses";

export type GetTripCountsError = "UNKNOWN_ERROR";

export async function getTripCounts(): Promise<Result<TripCounts, GetTripCountsError>> {
  try {
    const response = await client.get<SuccessResponse<TripCounts>>("/Analytics/trips");
    return ok(response.data.data);
  } catch {
    return fail("UNKNOWN_ERROR");
  }
}

export type GetEarningsError = "UNKNOWN_ERROR";

export async function getEarnings({
  from,
  to,
}: {
  /** Start of the time frame (inclusive), ISO date-time with a time zone. */
  from: string;
  /** End of the time frame (exclusive), ISO date-time with a time zone. */
  to: string;
}): Promise<Result<Earnings, GetEarningsError>> {
  try {
    const response = await client.get<SuccessResponse<Earnings>>("/Analytics/earnings", {
      params: { From: from, To: to },
    });
    return ok(response.data.data);
  } catch {
    return fail("UNKNOWN_ERROR");
  }
}

export type GetEarningsTimelineError = "UNKNOWN_ERROR";

export async function getEarningsTimeline({
  from,
  to,
  interval,
  timeZone,
}: {
  from: string;
  to: string;
  interval: EarningsInterval;
  /** IANA time zone the periods are aligned to, e.g. Asia/Baghdad. */
  timeZone: string;
}): Promise<Result<EarningsPeriod[], GetEarningsTimelineError>> {
  try {
    const response = await client.get<SuccessResponse<EarningsPeriod[]>>("/Analytics/earnings/timeline", {
      params: { From: from, To: to, Interval: interval, TimeZone: timeZone },
    });
    return ok(response.data.data ?? []);
  } catch {
    return fail("UNKNOWN_ERROR");
  }
}

export type GetTopProgramsError = "UNKNOWN_ERROR";

export async function getTopPrograms({
  from,
  to,
  limit,
}: {
  from: string;
  to: string;
  /** Number of programs to return, at most 20. */
  limit: number;
}): Promise<Result<ProgramEarnings[], GetTopProgramsError>> {
  try {
    const response = await client.get<SuccessResponse<ProgramEarnings[]>>("/Analytics/earnings/top-programs", {
      params: { From: from, To: to, Limit: limit },
    });
    return ok(response.data.data ?? []);
  } catch {
    return fail("UNKNOWN_ERROR");
  }
}

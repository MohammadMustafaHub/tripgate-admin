import { z } from 'zod';

/**
 * RFC 7807 problem details. Every non-2xx response in the API carries this
 * shape as its body.
 */
export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
}

export const problemDetailsSchema = z.object({
  type: z.string().nullish(),
  title: z.string().nullish(),
  status: z.coerce.number().int().nullish(),
  detail: z.string().nullish(),
  instance: z.string().nullish(),
});

/** The envelope every successful single-resource response is wrapped in. */
export interface Success<TData> {
  data: TData;
  isSuccessful?: boolean;
}

export function successSchema<TSchema extends z.ZodType>(dataSchema: TSchema) {
  return z.object({
    data: dataSchema,
    isSuccessful: z.boolean().optional(),
  });
}

/** Page metadata returned alongside every list response. */
export interface PaginationData {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

// The API types these as `integer | string`, so they are coerced rather than
// asserted to be numbers.
export const paginationDataSchema = z.object({
  page: z.coerce.number().int(),
  pageSize: z.coerce.number().int(),
  totalItems: z.coerce.number().int(),
  totalPages: z.coerce.number().int().optional(),
  hasNextPage: z.boolean().optional(),
  hasPreviousPage: z.boolean().optional(),
});

/** The envelope every successful list response is wrapped in. */
export interface Paginated<TItem> {
  data: TItem[];
  pagination: PaginationData;
  isSuccessful?: boolean;
}

export function paginatedSchema<TSchema extends z.ZodType>(itemSchema: TSchema) {
  return z.object({
    data: z.array(itemSchema),
    pagination: paginationDataSchema,
    isSuccessful: z.boolean().optional(),
  });
}

/**
 * Unwraps a success envelope, returning null when the body is missing or does
 * not match the schema. Endpoints turn that null into their UNEXPECTED case.
 */
export function parseSuccess<TData>(
  body: unknown,
  dataSchema: z.ZodType<TData>
): TData | null {
  const parsed = successSchema(dataSchema).safeParse(body);
  return parsed.success ? (parsed.data.data as TData) : null;
}

/** Same as parseSuccess, for the paginated envelope. */
export function parsePaginated<TItem>(
  body: unknown,
  itemSchema: z.ZodType<TItem>
): Paginated<TItem> | null {
  const parsed = paginatedSchema(itemSchema).safeParse(body);
  return parsed.success ? (parsed.data as Paginated<TItem>) : null;
}

export interface SuccessResponse<T> {
  data: T;
  isSuccessful: boolean;
}

export interface PaginationData {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationData;
  isSuccessful: boolean;
}

// RFC 7807 problem details returned by the API on failure.
export interface ErrorResponse {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
}

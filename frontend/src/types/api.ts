/**
 * Standard error response shape emitted by AyuCare NestJS backend and Next.js BFF routes.
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  path?: string;
  timestamp?: string;
  error?: string;
}

/**
 * Standard paginated list wrapper matching backend response shape.
 */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Query parameters for paginated search endpoints.
 */
export interface PaginationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}


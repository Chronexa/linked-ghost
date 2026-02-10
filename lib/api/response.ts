/**
 * Standard API Response Utilities
 * Consistent response format across all API routes
 */

import { NextResponse } from 'next/server';

// Standard success response
export function success<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

// Paginated response
export function paginated<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
        timestamp: new Date().toISOString(),
      },
    },
    { status: 200 }
  );
}

// Error response
export function error(
  code: string,
  message: string,
  status: number = 400,
  details?: any
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

// Common error responses
export const errors = {
  // 400 Bad Request
  badRequest: (message: string = 'Invalid request', details?: any) =>
    error('BAD_REQUEST', message, 400, details),

  // 401 Unauthorized
  unauthorized: (message: string = 'Unauthorized access') =>
    error('UNAUTHORIZED', message, 401),

  // 403 Forbidden
  forbidden: (message: string = 'Access forbidden') =>
    error('FORBIDDEN', message, 403),

  // 404 Not Found
  notFound: (resource: string = 'Resource') =>
    error('NOT_FOUND', `${resource} not found`, 404),

  // 409 Conflict
  conflict: (message: string = 'Resource already exists') =>
    error('CONFLICT', message, 409),

  // 422 Validation Error
  validation: (message: string = 'Validation failed', details?: any) =>
    error('VALIDATION_ERROR', message, 422, details),

  // 429 Rate Limit
  rateLimit: (message: string = 'Too many requests') =>
    error('RATE_LIMIT_EXCEEDED', message, 429),

  // 402 Payment Required (subscription limits)
  subscriptionLimit: (message: string = 'Plan limit reached') =>
    error('SUBSCRIPTION_LIMIT', message, 402),

  // 500 Internal Server Error
  internal: (message: string = 'Internal server error') =>
    error('INTERNAL_ERROR', message, 500),

  // 503 Service Unavailable
  serviceUnavailable: (message: string = 'Service temporarily unavailable') =>
    error('SERVICE_UNAVAILABLE', message, 503),
};

// Success responses
export const responses = {
  // 200 OK
  ok: <T>(data: T) => success(data, 200),

  // 201 Created
  created: <T>(data: T) => success(data, 201),

  // 204 No Content
  noContent: () =>
    new NextResponse(null, { status: 204 }),

  // Paginated list
  list: <T>(data: T[], page: number, limit: number, total: number) =>
    paginated(data, page, limit, total),
};

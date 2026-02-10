/**
 * Request Validation Utilities
 * Zod schema validation for API requests
 */

import { NextRequest } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { errors } from './response';

/**
 * Validate request body against Zod schema
 */
export async function validateBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<
  | { success: true; data: T }
  | { success: false; error: ReturnType<typeof errors.validation> }
> {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: errors.validation('Invalid request body', {
          issues: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        }),
      };
    }
    return {
      success: false,
      error: errors.badRequest('Failed to parse request body'),
    };
  }
}

/**
 * Validate query parameters against Zod schema
 */
export function validateQuery<T>(
  req: NextRequest,
  schema: ZodSchema<T>
):
  | { success: true; data: T }
  | { success: false; error: ReturnType<typeof errors.validation> } {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const data = schema.parse(query);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: errors.validation('Invalid query parameters', {
          issues: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        }),
      };
    }
    return {
      success: false,
      error: errors.badRequest('Failed to parse query parameters'),
    };
  }
}

/**
 * Get pagination parameters from query string
 */
export function getPagination(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Get sorting parameters from query string
 */
export function getSorting(req: NextRequest, allowedFields: string[]) {
  const { searchParams } = new URL(req.url);
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc').toLowerCase();

  // Validate sort field
  if (!allowedFields.includes(sortBy)) {
    return {
      sortBy: 'createdAt',
      sortOrder: 'desc' as const,
    };
  }

  return {
    sortBy,
    sortOrder: sortOrder === 'asc' ? ('asc' as const) : ('desc' as const),
  };
}

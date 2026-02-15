/**
 * Unit tests for request validation (validateBody, validateQuery)
 */

import { describe, it, expect } from 'vitest';
import { validateBody, validateQuery, getPagination } from '../validate';
import { z } from 'zod';

const bodySchema = z.object({
  name: z.string().min(1),
  count: z.number().int().min(1).max(10).optional().default(5),
});

const querySchema = z.object({
  name: z.string().min(1),
  limit: z.string().optional(),
});

function createMockRequest(body: unknown, url = 'http://localhost/api') {
  return {
    json: () => Promise.resolve(body),
    url,
  } as unknown as import('next/server').NextRequest;
}

describe('validateBody', () => {
  it('returns data when body is valid', async () => {
    const req = createMockRequest({ name: 'test', count: 3 });
    const result = await validateBody(req, bodySchema);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('test');
      expect(result.data.count).toBe(3);
    }
  });

  it('uses default when optional field missing', async () => {
    const req = createMockRequest({ name: 'only' });
    const result = await validateBody(req, bodySchema);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.count).toBe(5);
    }
  });

  it('returns validation error when body invalid', async () => {
    const req = createMockRequest({ name: '' });
    const result = await validateBody(req, bodySchema);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.status).toBe(422);
    }
  });

  it('returns validation error when required field missing', async () => {
    const req = createMockRequest({});
    const result = await validateBody(req, bodySchema);
    expect(result.success).toBe(false);
  });
});

describe('validateQuery', () => {
  it('returns data when query is valid', () => {
    const req = createMockRequest(null, 'http://localhost?name=foo');
    const result = validateQuery(req, querySchema);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('foo');
    }
  });

  it('returns error when query invalid', () => {
    const req = createMockRequest(null, 'http://localhost?name=');
    const result = validateQuery(req, querySchema);
    expect(result.success).toBe(false);
  });
});

describe('getPagination', () => {
  it('returns defaults when no params', () => {
    const req = createMockRequest(null, 'http://localhost');
    const out = getPagination(req);
    expect(out.page).toBe(1);
    expect(out.limit).toBe(20);
    expect(out.offset).toBe(0);
  });

  it('parses page and limit', () => {
    const req = createMockRequest(null, 'http://localhost?page=2&limit=10');
    const out = getPagination(req);
    expect(out.page).toBe(2);
    expect(out.limit).toBe(10);
    expect(out.offset).toBe(10);
  });
});

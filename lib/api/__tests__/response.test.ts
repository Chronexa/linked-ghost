/**
 * Unit tests for API response helpers
 */

import { describe, it, expect } from 'vitest';
import { responses, errors } from '../response';

describe('responses', () => {
  it('ok returns 200 with success and data', async () => {
    const res = responses.ok({ foo: 'bar' });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual({ foo: 'bar' });
    expect(json.meta?.timestamp).toBeDefined();
  });

  it('created returns 201 with data', async () => {
    const res = responses.created({ id: '123' });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual({ id: '123' });
  });

  it('noContent returns 204 with no body', () => {
    const res = responses.noContent();
    expect(res.status).toBe(204);
  });

  it('list returns paginated shape', async () => {
    const res = responses.list([{ id: '1' }, { id: '2' }], 1, 10, 25);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(2);
    expect(json.meta?.page).toBe(1);
    expect(json.meta?.limit).toBe(10);
    expect(json.meta?.total).toBe(25);
    expect(json.meta?.hasMore).toBe(true);
  });
});

describe('errors', () => {
  it('badRequest returns 400 and error shape', async () => {
    const res = errors.badRequest('Invalid input');
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error?.code).toBe('BAD_REQUEST');
    expect(json.error?.message).toBe('Invalid input');
  });

  it('unauthorized returns 401', async () => {
    const res = errors.unauthorized();
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error?.code).toBe('UNAUTHORIZED');
  });

  it('notFound returns 404 with resource name', async () => {
    const res = errors.notFound('Pillar');
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error?.message).toBe('Pillar not found');
  });

  it('validation returns 422 with details', async () => {
    const res = errors.validation('Invalid body', { issues: [{ path: 'name', message: 'Required' }] });
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error?.code).toBe('VALIDATION_ERROR');
    expect(json.error?.details?.issues).toHaveLength(1);
  });
});

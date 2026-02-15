/**
 * Unit tests for GET /api/health
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockTestConnection = vi.fn();
const mockTestRedis = vi.fn();
const mockTestOpenAI = vi.fn();

vi.mock('@/lib/db', () => ({ testConnection: () => mockTestConnection() }));
vi.mock('@/lib/redis', () => ({ testRedisConnection: () => mockTestRedis() }));
vi.mock('@/lib/ai/openai', () => ({ testOpenAIConnection: () => mockTestOpenAI() }));

describe('GET /api/health', () => {
  beforeEach(() => {
    mockTestConnection.mockResolvedValue(true);
    mockTestRedis.mockResolvedValue(true);
    mockTestOpenAI.mockResolvedValue(true);
  });

  it('returns 200 and healthy when db and redis are up', async () => {
    const { GET } = await import('../route');
    const req = new Request('http://localhost/api/health');
    const res = await GET(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe('healthy');
    expect(json.services.database).toBe('up');
    expect(json.services.redis).toBe('up');
    expect(json.responseTime).toBeDefined();
  });

  it('returns 503 when db is down', async () => {
    mockTestConnection.mockResolvedValue(false);

    const { GET } = await import('../route');
    const req = new Request('http://localhost/api/health');
    const res = await GET(req as any);
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.status).toBe('unhealthy');
    expect(json.services.database).toBe('down');
  });
});

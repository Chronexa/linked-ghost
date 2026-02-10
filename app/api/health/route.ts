/**
 * Health Check API
 * GET /api/health - System health check
 */

import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';
import { testRedisConnection } from '@/lib/redis';
import { testOpenAIConnection } from '@/lib/ai/openai';

/**
 * GET /api/health
 * Health check endpoint for monitoring
 */
export async function GET(req: NextRequest) {
  try {
    const startTime = Date.now();

    // Test all service connections in parallel
    const [dbHealthy, redisHealthy, openaiHealthy] = await Promise.all([
      testConnection().catch(() => false),
      testRedisConnection().catch(() => false),
      testOpenAIConnection().catch(() => false),
    ]);

    const responseTime = Date.now() - startTime;

    // System is healthy if critical services (DB, Redis) are up
    // OpenAI is important but not critical for basic operations
    const isHealthy = dbHealthy && redisHealthy;
    const status = isHealthy ? 200 : 503;

    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: dbHealthy ? 'up' : 'down',
          redis: redisHealthy ? 'up' : 'down',
          openai: openaiHealthy ? 'up' : 'down',
        },
        responseTime: `${responseTime}ms`,
        version: '1.0.0',
      },
      { status }
    );
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}

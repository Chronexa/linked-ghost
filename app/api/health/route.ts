/**
 * Health Check API
 * GET /api/health - System health check
 */

import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';
import { testRedisConnection } from '@/lib/redis';
import { testOpenAIConnection } from '@/lib/ai/openai';

export const dynamic = 'force-dynamic';


/**
 * GET /api/health
 * Health check endpoint for monitoring
 */
export async function GET(req: NextRequest) {
  try {
    const startTime = Date.now();
    const isProduction = process.env.NODE_ENV === 'production';

    // Critical services only in production; dev includes OpenAI check
    const [dbHealthy, redisHealthy, openaiHealthy] = await Promise.all([
      testConnection().catch(() => false),
      testRedisConnection().catch(() => false),
      isProduction ? Promise.resolve(null) : testOpenAIConnection().catch(() => false),
    ]);

    const responseTime = Date.now() - startTime;

    const isHealthy = dbHealthy && redisHealthy;
    const status = isHealthy ? 200 : 503;

    const services: Record<string, string> = {
      database: dbHealthy ? 'up' : 'down',
      redis: redisHealthy ? 'up' : 'down',
    };
    if (!isProduction && openaiHealthy !== null) {
      services.openai = openaiHealthy ? 'up' : 'down';
    }

    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        services,
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

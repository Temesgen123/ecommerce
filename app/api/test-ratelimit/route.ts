// app/api/test-ratelimit/route.ts
// TEMPORARY — delete after testing

import { authLimiter, getIP } from '@/lib/ratelimit';

export async function GET(request: Request) {
  try {
    const ip = getIP(request);
    const result = await authLimiter.limit(ip);

    return Response.json({
      ip,
      success: result.success,
      remaining: result.remaining,
      reset: new Date(result.reset).toISOString(),
      limit: result.limit,
    });
  } catch (error) {
    return Response.json(
      {
        error: 'Rate limiter failed',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

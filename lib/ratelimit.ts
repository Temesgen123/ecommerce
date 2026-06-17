import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Auth endpoints (login, register)
 * 5 attempts per 15 minutes per IP
 */
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  prefix: 'rl:auth',
  analytics: true,
});

/**
 * Contact form
 * 3 submissions per hour per IP
 */
export const contactLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  prefix: 'rl:contact',
  analytics: true,
});

/**
 * Newsletter signup
 * 3 attempts per hour per IP
 */
export const newsletterLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  prefix: 'rl:newsletter',
  analytics: true,
});

/**
 * Helper: get real IP from request headers (Vercel-aware)
 */
export function getIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  return '127.0.0.1';
}

/**
 * Helper: return a standard 429 response
 */
export function rateLimitResponse(retryAfter?: number): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests. Please try again later.',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...(retryAfter && { 'Retry-After': String(retryAfter) }),
      },
    },
  );
}

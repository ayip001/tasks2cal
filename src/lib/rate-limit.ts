/**
 * Redis-based sliding window rate limiter
 *
 * Uses Redis sorted sets to implement a sliding window algorithm that provides
 * more accurate rate limiting than fixed window approaches.
 */

import { RATE_LIMITS, RateLimitType } from './constants';
import { getRedisClient } from './redis';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp in seconds
  limit: number;
}

/**
 * Check rate limit using sliding window algorithm
 *
 * Uses Redis sorted sets with timestamps as scores. Each request adds a member
 * with the current timestamp. Old entries (outside the window) are removed.
 *
 * @param identifier - User ID or IP address
 * @param limitType - Type of rate limit to apply
 * @returns Rate limit result with allowed status and metadata
 */
export async function checkRateLimit(
  identifier: string,
  limitType: RateLimitType
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[limitType];
  const key = `ratelimit:${limitType}:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowSeconds * 1000;

  try {
    const client = getRedisClient();

    // Use a pipeline for atomic operations
    const pipeline = client.pipeline();

    // Remove old entries outside the sliding window
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Count current entries in the window
    pipeline.zcard(key);

    // Add current request with timestamp as score and unique member
    const member = `${now}:${Math.random().toString(36).substring(2, 9)}`;
    pipeline.zadd(key, now, member);

    // Set TTL on the key to auto-cleanup
    pipeline.expire(key, config.windowSeconds + 1);

    const results = await pipeline.exec();

    if (!results) {
      // Pipeline failed, allow request but log warning
      console.warn('Rate limit pipeline failed, allowing request');
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetAt: Math.ceil((now + config.windowSeconds * 1000) / 1000),
        limit: config.maxRequests,
      };
    }

    // Get count from zcard result (index 1, value at index 1 of that result)
    const countResult = results[1];
    const currentCount = (countResult && countResult[1] as number) || 0;

    const allowed = currentCount < config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - currentCount - (allowed ? 1 : 0));
    const resetAt = Math.ceil((now + config.windowSeconds * 1000) / 1000);

    // If not allowed, remove the member we just added
    if (!allowed) {
      await client.zrem(key, member);
    }

    return {
      allowed,
      remaining,
      resetAt,
      limit: config.maxRequests,
    };
  } catch (error) {
    // On Redis error, log and allow the request (fail open)
    console.error('Rate limit check failed:', error);
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: Math.ceil((Date.now() + config.windowSeconds * 1000) / 1000),
      limit: config.maxRequests,
    };
  }
}

/**
 * Get client identifier for rate limiting
 *
 * Prefers user ID (email) over IP address for authenticated requests.
 * Falls back to IP address for unauthenticated requests.
 *
 * @param request - The incoming request
 * @param userId - Optional authenticated user ID
 * @returns Identifier string for rate limiting
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return userId;
  }

  // Try to get IP from various headers (in order of preference)
  const headers = new Headers(request.headers);

  // X-Forwarded-For is common for proxied requests
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP (client IP) from the comma-separated list
    const clientIp = forwardedFor.split(',')[0].trim();
    if (clientIp) {
      return `ip:${clientIp}`;
    }
  }

  // X-Real-IP is set by some proxies
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return `ip:${realIp}`;
  }

  // Fallback to a generic identifier
  return 'ip:unknown';
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt.toString(),
  };
}

/**
 * Calculate retry-after seconds for 429 responses
 */
export function getRetryAfterSeconds(result: RateLimitResult): number {
  const now = Math.ceil(Date.now() / 1000);
  return Math.max(1, result.resetAt - now);
}

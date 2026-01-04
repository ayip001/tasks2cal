/**
 * Shared Redis singleton module
 *
 * Provides a single Redis client instance to prevent connection pool exhaustion.
 * All modules that need Redis should import from this file.
 */

import Redis from 'ioredis';

let redis: Redis | null = null;

/**
 * Get the shared Redis client instance.
 * Creates a new connection if one doesn't exist.
 *
 * @returns Redis client instance
 * @throws Error if REDIS_URL environment variable is not set
 */
export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set');
    }

    redis = new Redis(redisUrl);
  }
  return redis;
}

/**
 * Close the Redis connection.
 * Useful for graceful shutdown in tests or server cleanup.
 */
export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

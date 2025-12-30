/**
 * localStorage caching utilities with TTL-based invalidation
 */

import { CACHE_TTL_MS, CACHE_VERSION } from './constants';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

/**
 * Check if we're running in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Get data from cache if valid
 * @returns The cached data if valid, null otherwise
 */
export function getFromCache<T>(key: string): T | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const entry = JSON.parse(raw) as CacheEntry<T>;

    // Check version compatibility
    if (entry.version !== CACHE_VERSION) {
      localStorage.removeItem(key);
      return null;
    }

    // Check TTL
    if (!isCacheValid(key)) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch {
    // Invalid JSON or other error
    return null;
  }
}

/**
 * Store data in cache with timestamp
 */
export function setInCache<T>(key: string, data: T): void {
  if (!isBrowser()) {
    return;
  }

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    // Handle quota exceeded or other storage errors
    console.warn('Failed to set cache:', error);
  }
}

/**
 * Check if cached entry is still valid (within TTL)
 */
export function isCacheValid(key: string): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return false;
    }

    const entry = JSON.parse(raw) as CacheEntry<unknown>;

    // Check version
    if (entry.version !== CACHE_VERSION) {
      return false;
    }

    // Check if within TTL
    const age = Date.now() - entry.timestamp;
    return age < CACHE_TTL_MS;
  } catch {
    return false;
  }
}

/**
 * Get cache age in milliseconds
 * @returns Cache age in ms, or -1 if not cached
 */
export function getCacheAge(key: string): number {
  if (!isBrowser()) {
    return -1;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return -1;
    }

    const entry = JSON.parse(raw) as CacheEntry<unknown>;
    return Date.now() - entry.timestamp;
  } catch {
    return -1;
  }
}

/**
 * Invalidate cache entries matching a pattern
 * @param pattern - Prefix to match (e.g., "cache:tasks:" will invalidate all task caches)
 */
export function invalidateCache(pattern: string): void {
  if (!isBrowser()) {
    return;
  }

  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(pattern)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Clear all cache entries (those starting with "cache:")
 */
export function clearAllCache(): void {
  if (!isBrowser()) {
    return;
  }

  invalidateCache('cache:');
}

/**
 * Invalidate all cache for a specific user
 * @param userId - User email/ID
 */
export function invalidateUserCache(userId: string): void {
  if (!isBrowser()) {
    return;
  }

  // Invalidate all cache types for this user
  const patterns = [
    `cache:tasks:${userId}`,
    `cache:taskLists:${userId}`,
    `cache:events:${userId}`,
    `cache:calendars:${userId}`,
  ];

  patterns.forEach(pattern => invalidateCache(pattern));
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { StarredTasksData } from '@/types';
import { STARRED_SYNC_INTERVAL_MS, STARRED_STORAGE_KEY, MAX_STARRED_TASKS } from '@/lib/constants';

interface UseStarredTasksReturn {
  starredIds: Set<string>;
  isStarred: (taskId: string) => boolean;
  toggleStar: (taskId: string) => void;
  syncWithRedis: () => Promise<void>;
  cleanupDeletedTasks: (existingTaskIds: string[]) => void;
  loading: boolean;
  lastSynced: number | null;
}

function getFromLocalStorage(userId: string): StarredTasksData | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(STARRED_STORAGE_KEY(userId));
    if (!data) return null;
    return JSON.parse(data) as StarredTasksData;
  } catch {
    return null;
  }
}

function saveToLocalStorage(userId: string, data: StarredTasksData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STARRED_STORAGE_KEY(userId), JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save starred tasks to localStorage:', error);
  }
}

async function fetchFromRedis(): Promise<StarredTasksData | null> {
  try {
    const response = await fetch('/api/starred');
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function pushToRedis(data: StarredTasksData): Promise<boolean> {
  try {
    const response = await fetch('/api/starred', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function useStarredTasks(userId: string | undefined): UseStarredTasksReturn {
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<number | null>(null);
  const lastSyncTimeRef = useRef<number>(0);
  const pendingSyncRef = useRef<NodeJS.Timeout | null>(null);

  // Initial load and sync with Redis
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const initializeStarred = async () => {
      setLoading(true);

      // Load from localStorage first for quick display
      const localData = getFromLocalStorage(userId);
      if (localData) {
        setStarredIds(new Set(localData.taskIds));
      }

      // Then sync with Redis
      try {
        const redisData = await fetchFromRedis();

        const localTime = localData?.lastModified ?? 0;
        const redisTime = redisData?.lastModified ?? 0;

        if (localTime > redisTime && localData) {
          // Local is newer - push to Redis
          await pushToRedis(localData);
          setLastSynced(Date.now());
        } else if (redisTime > localTime && redisData) {
          // Redis is newer - pull to localStorage
          saveToLocalStorage(userId, redisData);
          setStarredIds(new Set(redisData.taskIds));
          setLastSynced(Date.now());
        } else if (localTime === redisTime) {
          // Equal or both missing - no sync needed
          setLastSynced(Date.now());
        }
      } catch (error) {
        console.error('Failed to sync starred tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeStarred();
  }, [userId]);

  // Debounced sync to Redis
  const scheduleDebouncedSync = useCallback(() => {
    if (!userId) return;

    // Clear any existing pending sync
    if (pendingSyncRef.current) {
      clearTimeout(pendingSyncRef.current);
    }

    // Only sync if enough time has passed since last sync
    const timeSinceLastSync = Date.now() - lastSyncTimeRef.current;
    const delay = Math.max(0, STARRED_SYNC_INTERVAL_MS - timeSinceLastSync);

    pendingSyncRef.current = setTimeout(async () => {
      const localData = getFromLocalStorage(userId);
      if (localData) {
        const success = await pushToRedis(localData);
        if (success) {
          lastSyncTimeRef.current = Date.now();
          setLastSynced(Date.now());
        }
      }
    }, delay);
  }, [userId]);

  const isStarred = useCallback((taskId: string): boolean => {
    return starredIds.has(taskId);
  }, [starredIds]);

  const toggleStar = useCallback((taskId: string) => {
    if (!userId) return;

    setStarredIds((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        // Enforce maximum starred tasks limit
        if (newSet.size >= MAX_STARRED_TASKS) {
          console.warn(`Maximum of ${MAX_STARRED_TASKS} starred tasks reached`);
          return prev;
        }
        newSet.add(taskId);
      }

      // Update localStorage immediately
      const newData: StarredTasksData = {
        taskIds: Array.from(newSet),
        lastModified: Date.now(),
      };
      saveToLocalStorage(userId, newData);

      // Schedule debounced sync to Redis
      scheduleDebouncedSync();

      return newSet;
    });
  }, [userId, scheduleDebouncedSync]);

  const syncWithRedis = useCallback(async () => {
    if (!userId) return;

    const localData = getFromLocalStorage(userId);
    const redisData = await fetchFromRedis();

    const localTime = localData?.lastModified ?? 0;
    const redisTime = redisData?.lastModified ?? 0;

    if (localTime > redisTime && localData) {
      // Local is newer - push to Redis
      await pushToRedis(localData);
    } else if (redisTime > localTime && redisData) {
      // Redis is newer - pull to localStorage
      saveToLocalStorage(userId, redisData);
      setStarredIds(new Set(redisData.taskIds));
    }

    setLastSynced(Date.now());
    lastSyncTimeRef.current = Date.now();
  }, [userId]);

  const cleanupDeletedTasks = useCallback((existingTaskIds: string[]) => {
    if (!userId) return;

    const existingSet = new Set(existingTaskIds);

    setStarredIds((prev) => {
      const newSet = new Set<string>();
      let hasChanges = false;

      prev.forEach((taskId) => {
        if (existingSet.has(taskId)) {
          newSet.add(taskId);
        } else {
          hasChanges = true;
        }
      });

      if (hasChanges) {
        // Update localStorage with cleaned data
        const newData: StarredTasksData = {
          taskIds: Array.from(newSet),
          lastModified: Date.now(),
        };
        saveToLocalStorage(userId, newData);

        // Schedule sync to Redis
        scheduleDebouncedSync();

        return newSet;
      }

      return prev;
    });
  }, [userId, scheduleDebouncedSync]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pendingSyncRef.current) {
        clearTimeout(pendingSyncRef.current);
      }
    };
  }, []);

  return {
    starredIds,
    isStarred,
    toggleStar,
    syncWithRedis,
    cleanupDeletedTasks,
    loading,
    lastSynced,
  };
}

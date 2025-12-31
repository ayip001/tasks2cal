'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { WorkingHourFiltersData, WorkingHourFilter } from '@/types';
import {
  WORKING_HOUR_FILTERS_SYNC_INTERVAL_MS,
  WORKING_HOUR_FILTERS_STORAGE_KEY,
} from '@/lib/constants';

interface UseWorkingHourFiltersReturn {
  filters: Record<string, WorkingHourFilter>;
  getFilter: (workingHourId: string) => WorkingHourFilter | undefined;
  setFilter: (workingHourId: string, filter: WorkingHourFilter | undefined) => void;
  hasFilter: (workingHourId: string) => boolean;
  syncWithRedis: () => Promise<void>;
  loading: boolean;
}

function getFromLocalStorage(userId: string): WorkingHourFiltersData | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(WORKING_HOUR_FILTERS_STORAGE_KEY(userId));
    if (!data) return null;
    return JSON.parse(data) as WorkingHourFiltersData;
  } catch {
    return null;
  }
}

function saveToLocalStorage(userId: string, data: WorkingHourFiltersData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(WORKING_HOUR_FILTERS_STORAGE_KEY(userId), JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save working hour filters to localStorage:', error);
  }
}

async function fetchFromRedis(): Promise<WorkingHourFiltersData | null> {
  try {
    const response = await fetch('/api/working-hour-filters');
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function pushToRedis(data: WorkingHourFiltersData): Promise<boolean> {
  try {
    const response = await fetch('/api/working-hour-filters', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function useWorkingHourFilters(userId: string | undefined): UseWorkingHourFiltersReturn {
  const [filters, setFilters] = useState<Record<string, WorkingHourFilter>>({});
  const [loading, setLoading] = useState(true);
  const lastSyncTimeRef = useRef<number>(0);
  const pendingSyncRef = useRef<NodeJS.Timeout | null>(null);

  // Initial load and sync with Redis
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const initializeFilters = async () => {
      setLoading(true);

      // Load from localStorage first for quick display
      const localData = getFromLocalStorage(userId);
      if (localData) {
        setFilters(localData.filters);
      }

      // Then sync with Redis
      try {
        const redisData = await fetchFromRedis();

        const localTime = localData?.lastModified ?? 0;
        const redisTime = redisData?.lastModified ?? 0;

        if (localTime > redisTime && localData) {
          // Local is newer - push to Redis
          await pushToRedis(localData);
        } else if (redisTime > localTime && redisData) {
          // Redis is newer - pull to localStorage
          saveToLocalStorage(userId, redisData);
          setFilters(redisData.filters);
        }
      } catch (error) {
        console.error('Failed to sync working hour filters:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeFilters();

    // Listen for localStorage changes from other hook instances (e.g., settings panel)
    const handleStorageChange = () => {
      const localData = getFromLocalStorage(userId);
      if (localData) {
        setFilters(localData.filters);
      }
    };

    // Custom event for same-page updates (storage event doesn't fire on same page)
    window.addEventListener('workingHourFiltersChanged', handleStorageChange);

    return () => {
      window.removeEventListener('workingHourFiltersChanged', handleStorageChange);
    };
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
    const delay = Math.max(0, WORKING_HOUR_FILTERS_SYNC_INTERVAL_MS - timeSinceLastSync);

    pendingSyncRef.current = setTimeout(async () => {
      const localData = getFromLocalStorage(userId);
      if (localData) {
        const success = await pushToRedis(localData);
        if (success) {
          lastSyncTimeRef.current = Date.now();
        }
      }
    }, delay);
  }, [userId]);

  const getFilter = useCallback(
    (workingHourId: string): WorkingHourFilter | undefined => {
      return filters[workingHourId];
    },
    [filters]
  );

  const hasFilter = useCallback(
    (workingHourId: string): boolean => {
      const filter = filters[workingHourId];
      if (!filter) return false;

      // Check if any filter properties are set
      return !!(
        filter.searchText ||
        filter.starredOnly ||
        filter.hideContainerTasks ||
        filter.hasDueDate !== undefined
      );
    },
    [filters]
  );

  const setFilter = useCallback(
    (workingHourId: string, filter: WorkingHourFilter | undefined) => {
      if (!userId) return;

      setFilters((prev) => {
        const newFilters = { ...prev };

        if (!filter || !hasFilterValues(filter)) {
          // Remove the filter if it's undefined or empty
          delete newFilters[workingHourId];
        } else {
          newFilters[workingHourId] = filter;
        }

        // Update localStorage immediately
        const newData: WorkingHourFiltersData = {
          filters: newFilters,
          lastModified: Date.now(),
        };
        saveToLocalStorage(userId, newData);

        // Notify other hook instances of the change (defer to avoid updating during render)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('workingHourFiltersChanged'));
        }, 0);

        // Schedule debounced sync to Redis
        scheduleDebouncedSync();

        return newFilters;
      });
    },
    [userId, scheduleDebouncedSync]
  );

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
      setFilters(redisData.filters);
    }

    lastSyncTimeRef.current = Date.now();
  }, [userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pendingSyncRef.current) {
        clearTimeout(pendingSyncRef.current);
      }
    };
  }, []);

  return {
    filters,
    getFilter,
    setFilter,
    hasFilter,
    syncWithRedis,
    loading,
  };
}

// Helper to check if a filter has any values set
function hasFilterValues(filter: WorkingHourFilter): boolean {
  return !!(
    filter.searchText ||
    filter.starredOnly ||
    filter.hideContainerTasks ||
    filter.hasDueDate !== undefined
  );
}

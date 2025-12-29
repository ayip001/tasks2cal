'use client';

import { useState, useCallback, useEffect } from 'react';
import { TaskPlacement } from '@/types';

const STORAGE_PREFIX = 'placements:';
const STALE_DAYS = 7;

function getStorageKey(date: string): string {
  return `${STORAGE_PREFIX}${date}`;
}

function cleanupStalePlacements(): void {
  if (typeof window === 'undefined') return;

  const now = new Date();
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      const dateStr = key.slice(STORAGE_PREFIX.length);
      const parsedDate = new Date(dateStr);

      if (!isNaN(parsedDate.getTime())) {
        const daysDiff = (now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > STALE_DAYS) {
          keysToRemove.push(key);
        }
      }
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

function loadFromStorage(date: string): TaskPlacement[] {
  if (typeof window === 'undefined') return [];

  try {
    const key = getStorageKey(date);
    const data = localStorage.getItem(key);
    if (!data) return [];
    return JSON.parse(data) as TaskPlacement[];
  } catch {
    return [];
  }
}

function saveToStorage(date: string, placements: TaskPlacement[]): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getStorageKey(date);
    if (placements.length === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(placements));
    }
    // Dispatch a storage event so other tabs can react
    window.dispatchEvent(new StorageEvent('storage', { key }));
  } catch {
    // Silently fail - localStorage might be full or disabled
  }
}

// Run cleanup once on module load
if (typeof window !== 'undefined') {
  cleanupStalePlacements();
}

export function useLocalPlacements(date: string) {
  // Use local state for immediate updates, synced with localStorage
  const [localPlacements, setLocalPlacements] = useState<TaskPlacement[]>(() =>
    loadFromStorage(date)
  );
  const [currentDate, setCurrentDate] = useState(date);

  // Handle date changes
  if (date !== currentDate) {
    setCurrentDate(date);
    setLocalPlacements(loadFromStorage(date));
  }

  // Subscribe to storage events for cross-tab sync
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === getStorageKey(date) || e.key === null) {
        setLocalPlacements(loadFromStorage(date));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [date]);

  const setPlacements = useCallback(
    (newPlacements: TaskPlacement[]) => {
      setLocalPlacements(newPlacements);
      saveToStorage(date, newPlacements);
    },
    [date]
  );

  const addPlacement = useCallback(
    (placement: TaskPlacement) => {
      setLocalPlacements((prev) => {
        const updated = [...prev, placement];
        saveToStorage(date, updated);
        return updated;
      });
    },
    [date]
  );

  const updatePlacement = useCallback(
    (placementId: string, updates: Partial<TaskPlacement>) => {
      setLocalPlacements((prev) => {
        const updated = prev.map((p) =>
          p.id === placementId ? { ...p, ...updates } : p
        );
        saveToStorage(date, updated);
        return updated;
      });
    },
    [date]
  );

  const removePlacement = useCallback(
    (placementId: string) => {
      setLocalPlacements((prev) => {
        const updated = prev.filter((p) => p.id !== placementId);
        saveToStorage(date, updated);
        return updated;
      });
    },
    [date]
  );

  const clearPlacements = useCallback(() => {
    setLocalPlacements([]);
    saveToStorage(date, []);
  }, [date]);

  return {
    placements: localPlacements,
    loading: false,
    addPlacement,
    updatePlacement,
    removePlacement,
    clearPlacements,
    setPlacements,
  };
}

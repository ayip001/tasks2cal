'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  GoogleTask,
  GoogleTaskList,
  GoogleCalendarEvent,
  GoogleCalendar,
  UserSettings,
  TaskFilter,
} from '@/types';
import { DEFAULT_SETTINGS, CACHE_KEYS } from '@/lib/constants';
import { normalizeIanaTimeZone } from '@/lib/timezone';
import { getLocaleFromCookieClient, getLocaleFromStorage, setLocaleCookie, setLocaleStorage } from '@/lib/locale';
import { getFromCache, setInCache } from '@/lib/cache';
import type { Locale } from '@/i18n/config';
import { applyTaskFilter } from '@/lib/filter-utils';

// Update the last data refresh timestamp in localStorage
function updateLastRefreshTime(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lastDataRefreshTime', Date.now().toString());
  }
}

export function useTasks(forceRefresh = false) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (bypassCache = false) => {
    const userId = session?.user?.email;

    // Try cache first (unless bypassing)
    if (userId && !bypassCache) {
      const cachedTasks = getFromCache<GoogleTask[]>(CACHE_KEYS.tasks(userId));
      const cachedLists = getFromCache<GoogleTaskList[]>(CACHE_KEYS.taskLists(userId));

      if (cachedTasks && cachedLists) {
        setTasks(cachedTasks);
        setTaskLists(cachedLists);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const [tasksRes, listsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/tasks?type=lists'),
      ]);

      if (!tasksRes.ok || !listsRes.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const [tasksData, listsData] = await Promise.all([tasksRes.json(), listsRes.json()]);

      setTasks(tasksData);
      setTaskLists(listsData);

      // Cache the results and update refresh timestamp
      if (userId) {
        setInCache(CACHE_KEYS.tasks(userId), tasksData);
        setInCache(CACHE_KEYS.taskLists(userId), listsData);
      }
      updateLastRefreshTime();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetchTasks(forceRefresh);
  }, [fetchTasks, forceRefresh]);

  const refetch = useCallback(() => fetchTasks(true), [fetchTasks]);

  return { tasks, taskLists, loading, error, refetch };
}

export function useCalendarEvents(date: string, calendarId: string = 'primary', selectedTimeZone: string = 'UTC', forceRefresh = false) {
  const { data: session } = useSession();
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (bypassCache = false) => {
    if (!date) return;

    const userId = session?.user?.email;

    // Try cache first (unless bypassing)
    if (userId && !bypassCache) {
      const cachedEvents = getFromCache<GoogleCalendarEvent[]>(
        CACHE_KEYS.events(userId, date, calendarId)
      );

      if (cachedEvents) {
        setEvents(cachedEvents);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const effectiveTimeZone = normalizeIanaTimeZone(selectedTimeZone);
      const res = await fetch(
        `/api/calendar?type=events&date=${date}&calendarId=${encodeURIComponent(calendarId)}&timeZone=${encodeURIComponent(effectiveTimeZone)}`
      );

      if (!res.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const data = await res.json();
      setEvents(data);

      // Cache the results and update refresh timestamp
      if (userId) {
        setInCache(CACHE_KEYS.events(userId, date, calendarId), data);
      }
      updateLastRefreshTime();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [date, calendarId, selectedTimeZone, session?.user?.email]);

  useEffect(() => {
    fetchEvents(forceRefresh);
  }, [fetchEvents, forceRefresh]);

  const refetch = useCallback(() => fetchEvents(true), [fetchEvents]);

  return { events, loading, error, refetch };
}

export function useCalendars(forceRefresh = false) {
  const { data: session } = useSession();
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCalendars = useCallback(async (bypassCache = false) => {
    const userId = session?.user?.email;

    // Try cache first (unless bypassing)
    if (userId && !bypassCache) {
      const cachedCalendars = getFromCache<GoogleCalendar[]>(CACHE_KEYS.calendars(userId));

      if (cachedCalendars) {
        setCalendars(cachedCalendars);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/calendar?type=calendars');
      if (res.ok) {
        const data = await res.json();
        setCalendars(data);

        // Cache the results and update refresh timestamp
        if (userId) {
          setInCache(CACHE_KEYS.calendars(userId), data);
        }
        updateLastRefreshTime();
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetchCalendars(forceRefresh);
  }, [fetchCalendars, forceRefresh]);

  const refetch = useCallback(() => fetchCalendars(true), [fetchCalendars]);

  return { calendars, loading, refetch };
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  // Initialize locale from localStorage for instant access (avoids flash of wrong language)
  // localStorage is synchronous and available immediately on client
  const [locale, setLocale] = useState<Locale>(() => getLocaleFromStorage());

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);

        // Handle locale sync between cookie/localStorage and Redis
        const cookieLocale = getLocaleFromCookieClient();
        const redisLocale = data.locale as Locale | undefined;

        if (!redisLocale) {
          // New or legacy user - cookie determines preference
          // Save cookie locale to Redis and localStorage
          setLocale(cookieLocale);
          setLocaleStorage(cookieLocale);
          const updateRes = await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locale: cookieLocale }),
          });
          // Use PUT response to update settings (avoids redundant fetch)
          if (updateRes.ok) {
            const updatedSettings = await updateRes.json();
            setSettings(updatedSettings);
          }
        } else if (redisLocale !== cookieLocale) {
          // Redis is source of truth - sync cookie and localStorage
          setLocaleCookie(redisLocale); // This also updates localStorage
          setLocale(redisLocale);
        } else {
          // Ensure localStorage is in sync
          setLocaleStorage(redisLocale);
          setLocale(redisLocale);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      const data = await res.json();
      setSettings(data);

      // If locale was updated, sync to cookie
      if (updates.locale) {
        setLocaleCookie(updates.locale);
        setLocale(updates.locale);
      }

      return data;
    }

    throw new Error('Failed to update settings');
  };

  return { settings, loading, updateSettings, refetch: fetchSettings, locale };
}

export function filterTasks(tasks: GoogleTask[], filter: TaskFilter): GoogleTask[] {
  return applyTaskFilter(tasks, filter);
}

// Re-export cache invalidation for use in components
export { invalidateUserCache } from '@/lib/cache';

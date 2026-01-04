import { UserSettings, StarredTasksData, WorkingHours, WorkingHourFiltersData } from '@/types';
import { DEFAULT_SETTINGS, KV_KEYS } from '../constants';
import { getRedisClient } from '../redis';

// Migration helper: Auto-generate IDs for working hours that don't have them
function migrateWorkingHours(workingHours: WorkingHours[]): WorkingHours[] {
  return workingHours.map((wh, index) => ({
    ...wh,
    id: wh.id || `wh-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
  }));
}

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const key = KV_KEYS.settings(userId);
  const redis = getRedisClient();
  const data = await redis.get(key);

  if (!data) {
    return DEFAULT_SETTINGS;
  }

  try {
    const settings = JSON.parse(data) as UserSettings;

    // Migrate working hours to include IDs if they don't have them
    if (settings.workingHours && settings.workingHours.length > 0) {
      const migratedWorkingHours = migrateWorkingHours(settings.workingHours);

      // If any working hours were migrated, save the updated settings
      const needsMigration = migratedWorkingHours.some((wh, idx) => wh.id !== settings.workingHours[idx].id);
      if (needsMigration) {
        const updatedSettings = { ...settings, workingHours: migratedWorkingHours };
        await redis.set(key, JSON.stringify(updatedSettings));
        return updatedSettings;
      }
    }

    return settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function setUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<UserSettings> {
  const key = KV_KEYS.settings(userId);
  const redis = getRedisClient();
  const currentSettings = await getUserSettings(userId);
  const newSettings = { ...currentSettings, ...settings };
  await redis.set(key, JSON.stringify(newSettings));
  return newSettings;
}

export async function getStarredTasks(userId: string): Promise<StarredTasksData | null> {
  const key = KV_KEYS.starred(userId);
  const redis = getRedisClient();
  const data = await redis.get(key);

  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data) as StarredTasksData;
  } catch {
    return null;
  }
}

export async function setStarredTasks(userId: string, data: StarredTasksData): Promise<void> {
  const key = KV_KEYS.starred(userId);
  const redis = getRedisClient();
  await redis.set(key, JSON.stringify(data));
}

export async function getWorkingHourFilters(userId: string): Promise<WorkingHourFiltersData | null> {
  const key = KV_KEYS.workingHourFilters(userId);
  const redis = getRedisClient();
  const data = await redis.get(key);

  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data) as WorkingHourFiltersData;
  } catch {
    return null;
  }
}

export async function setWorkingHourFilters(userId: string, data: WorkingHourFiltersData): Promise<void> {
  const key = KV_KEYS.workingHourFilters(userId);
  const redis = getRedisClient();
  await redis.set(key, JSON.stringify(data));
}

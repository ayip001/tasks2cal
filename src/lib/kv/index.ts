import Redis from 'ioredis';
import { UserSettings, StarredTasksData } from '@/types';
import { DEFAULT_SETTINGS, KV_KEYS } from '../constants';

function _createRedisClient(): Redis {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set');
  }

  return new Redis(redisUrl);
}

const redis = _createRedisClient();

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const key = KV_KEYS.settings(userId);
  const data = await redis.get(key);

  if (!data) {
    return DEFAULT_SETTINGS;
  }

  try {
    return JSON.parse(data) as UserSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function setUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<UserSettings> {
  const key = KV_KEYS.settings(userId);
  const currentSettings = await getUserSettings(userId);
  const newSettings = { ...currentSettings, ...settings };
  await redis.set(key, JSON.stringify(newSettings));
  return newSettings;
}

export async function getStarredTasks(userId: string): Promise<StarredTasksData | null> {
  const key = KV_KEYS.starred(userId);
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
  await redis.set(key, JSON.stringify(data));
}

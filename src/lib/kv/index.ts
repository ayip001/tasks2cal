import Redis from 'ioredis';
import { UserSettings, TaskPlacement } from '@/types';
import { DEFAULT_SETTINGS, KV_KEYS, PLACEMENT_TTL_SECONDS } from '../constants';

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

export async function getPlacements(userId: string, date: string): Promise<TaskPlacement[]> {
  const key = KV_KEYS.placements(userId, date);
  const data = await redis.get(key);

  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data) as TaskPlacement[];
  } catch {
    return [];
  }
}

export async function setPlacements(
  userId: string,
  date: string,
  placements: TaskPlacement[]
): Promise<void> {
  const key = KV_KEYS.placements(userId, date);
  await redis.setex(key, PLACEMENT_TTL_SECONDS, JSON.stringify(placements));
}

export async function addPlacement(
  userId: string,
  date: string,
  placement: TaskPlacement
): Promise<TaskPlacement[]> {
  const placements = await getPlacements(userId, date);
  placements.push(placement);
  await setPlacements(userId, date, placements);
  return placements;
}

export async function updatePlacement(
  userId: string,
  date: string,
  placementId: string,
  updates: Partial<TaskPlacement>
): Promise<TaskPlacement[]> {
  const placements = await getPlacements(userId, date);
  const index = placements.findIndex((p) => p.id === placementId);

  if (index !== -1) {
    placements[index] = { ...placements[index], ...updates };
    await setPlacements(userId, date, placements);
  }

  return placements;
}

export async function removePlacement(
  userId: string,
  date: string,
  placementId: string
): Promise<TaskPlacement[]> {
  const placements = await getPlacements(userId, date);
  const filtered = placements.filter((p) => p.id !== placementId);
  await setPlacements(userId, date, filtered);
  return filtered;
}

export async function clearPlacements(userId: string, date: string): Promise<void> {
  const key = KV_KEYS.placements(userId, date);
  await redis.del(key);
}

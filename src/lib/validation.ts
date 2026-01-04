/**
 * Zod validation schemas for API inputs
 *
 * Provides runtime validation for all data stored in Redis to prevent
 * injection attacks and ensure data integrity.
 */

import { z } from 'zod';
import {
  MAX_STARRED_TASKS,
  MAX_WORKING_HOUR_FILTERS,
  MAX_WORKING_HOURS,
  MAX_SEARCH_TEXT_LENGTH,
  MAX_LIST_COLORS,
} from './constants';

// Time format regex (HH:MM)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Hex color regex (#RRGGBB)
const hexColorRegex = /^#[0-9a-fA-F]{6}$/;

// Calendar ID regex (alphanumeric with some special chars, or "primary")
const calendarIdRegex = /^[a-zA-Z0-9@._-]{1,256}$|^primary$/;

// Task ID regex (Google Task IDs are alphanumeric)
const taskIdRegex = /^[a-zA-Z0-9_-]{1,256}$/;

// Working hour ID regex
const workingHourIdRegex = /^[a-zA-Z0-9_-]{1,64}$/;

// List ID regex
const listIdRegex = /^[a-zA-Z0-9@._-]{1,256}$/;

/**
 * Working Hours schema
 */
export const WorkingHoursSchema = z.object({
  id: z.string().regex(workingHourIdRegex, 'Invalid working hour ID format'),
  start: z.string().regex(timeRegex, 'Invalid time format (expected HH:MM)'),
  end: z.string().regex(timeRegex, 'Invalid time format (expected HH:MM)'),
  name: z.string().max(100, 'Name too long').optional(),
  color: z.string().regex(hexColorRegex, 'Invalid color format').optional(),
  useColorForTasks: z.boolean().optional(),
});

/**
 * User Settings schema (for PUT requests - partial updates)
 */
export const UserSettingsUpdateSchema = z.object({
  defaultTaskDuration: z.number().int().min(5).max(480).optional(),
  taskColor: z.string().regex(hexColorRegex, 'Invalid color format').optional(),
  workingHours: z.array(WorkingHoursSchema).max(MAX_WORKING_HOURS).optional(),
  minTimeBetweenTasks: z.number().int().min(0).max(120).optional(),
  ignoreContainerTasks: z.boolean().optional(),
  selectedCalendarId: z.string().regex(calendarIdRegex, 'Invalid calendar ID').optional(),
  slotMinTime: z.string().regex(timeRegex, 'Invalid time format').optional(),
  slotMaxTime: z.string().regex(timeRegex, 'Invalid time format').optional(),
  timeFormat: z.enum(['12h', '24h']).optional(),
  timezone: z.string().max(100).optional(),
  calendarTimezones: z.record(
    z.string().regex(calendarIdRegex),
    z.string().max(100)
  ).optional(),
  locale: z.enum(['en', 'zh-hk']).optional(),
  listColors: z.record(
    z.string().regex(listIdRegex),
    z.string().regex(hexColorRegex)
  ).refine(
    (obj) => Object.keys(obj).length <= MAX_LIST_COLORS,
    { message: `Maximum of ${MAX_LIST_COLORS} list colors allowed` }
  ).optional(),
});

/**
 * Starred Tasks Data schema
 */
export const StarredTasksDataSchema = z.object({
  taskIds: z.array(z.string().regex(taskIdRegex, 'Invalid task ID format'))
    .max(MAX_STARRED_TASKS, `Maximum of ${MAX_STARRED_TASKS} starred tasks allowed`),
  lastModified: z.number().int().positive(),
});

/**
 * Working Hour Filter schema
 */
export const WorkingHourFilterSchema = z.object({
  searchText: z.string().max(MAX_SEARCH_TEXT_LENGTH, 'Search text too long').optional(),
  starredOnly: z.boolean().optional(),
  hideContainerTasks: z.boolean().optional(),
  hasDueDate: z.boolean().optional(),
});

/**
 * Working Hour Filters Data schema
 */
export const WorkingHourFiltersDataSchema = z.object({
  filters: z.record(
    z.string().regex(workingHourIdRegex, 'Invalid working hour ID'),
    WorkingHourFilterSchema
  ).refine(
    (obj) => Object.keys(obj).length <= MAX_WORKING_HOUR_FILTERS,
    { message: `Maximum of ${MAX_WORKING_HOUR_FILTERS} working hour filters allowed` }
  ),
  lastModified: z.number().int().positive(),
});

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Validate and parse data against a schema
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Get the first error message for simplicity (Zod v4 uses 'issues')
  const firstError = result.error.issues[0];
  const path = firstError.path.length > 0 ? `${firstError.path.join('.')}: ` : '';
  const message = `${path}${firstError.message}`;

  return { success: false, error: message };
}

/**
 * Task Placement schema (for calendar event creation)
 */
export const TaskPlacementSchema = z.object({
  id: z.string().max(256, 'ID too long'),
  taskId: z.string().regex(taskIdRegex, 'Invalid task ID format'),
  taskTitle: z.string().max(1024, 'Task title too long'),
  listId: z.string().regex(listIdRegex, 'Invalid list ID format').optional(),
  listTitle: z.string().max(256, 'List title too long').optional(),
  startTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, 'Invalid datetime format'),
  duration: z.number().int().min(1).max(1440, 'Duration must be 1-1440 minutes'),
  workingHourColor: z.string().regex(hexColorRegex, 'Invalid color format').optional(),
});

/**
 * Calendar create events request schema
 */
export const CalendarCreateEventsSchema = z.object({
  calendarId: z.string().regex(calendarIdRegex, 'Invalid calendar ID'),
  placements: z.array(TaskPlacementSchema).max(100, 'Maximum of 100 placements allowed'),
  taskColor: z.string().regex(hexColorRegex, 'Invalid task color format'),
  listColors: z.record(
    z.string().regex(listIdRegex),
    z.string().regex(hexColorRegex)
  ).refine(
    (obj) => Object.keys(obj).length <= MAX_LIST_COLORS,
    { message: `Maximum of ${MAX_LIST_COLORS} list colors allowed` }
  ).optional(),
});

// Export types inferred from schemas
export type ValidatedUserSettingsUpdate = z.infer<typeof UserSettingsUpdateSchema>;
export type ValidatedStarredTasksData = z.infer<typeof StarredTasksDataSchema>;
export type ValidatedWorkingHourFiltersData = z.infer<typeof WorkingHourFiltersDataSchema>;
export type ValidatedCalendarCreateEvents = z.infer<typeof CalendarCreateEventsSchema>;

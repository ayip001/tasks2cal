export interface WorkingHours {
  id: string;      // Unique identifier for the working hour period
  start: string;
  end: string;
  name?: string;              // Display name for the period
  color?: string;             // Color for outline and optionally tasks
  useColorForTasks?: boolean; // Apply this color to tasks placed here
}

export interface UserSettings {
  defaultTaskDuration: number;
  taskColor: string;
  workingHours: WorkingHours[];
  minTimeBetweenTasks: number;
  ignoreContainerTasks: boolean;
  selectedCalendarId: string;
  slotMinTime: string;
  slotMaxTime: string;
  timeFormat: '12h' | '24h';
  timezone?: string; // User's selected IANA timezone string
  calendarTimezones?: Record<string, string>; // Map of calendarId -> timezone
  locale?: 'en' | 'zh-hk'; // User's preferred language
  listColors?: Record<string, string>; // Map of task listId -> color for per-list color customization
}

export interface TaskPlacement {
  id: string;
  taskId: string;
  taskTitle: string;
  listId?: string;
  listTitle?: string;
  startTime: string;
  duration: number;
  workingHourColor?: string; // Color applied from working hour period
}

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  parent?: string;
  position?: string;
  listId: string;
  listTitle: string;
  hasSubtasks?: boolean;
  isPlaced?: boolean;
  isStarred?: boolean;  // Populated at runtime from starred store
}

export interface GoogleTaskList {
  id: string;
  title: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  colorId?: string;
  isTemporary?: boolean;
  taskPlacementId?: string;
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  primary?: boolean;
  timeZone?: string; // IANA timezone from Google Calendar API
}

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface TaskFilter {
  listIds?: string[];
  hasDueDate?: boolean;
  searchText?: string;
  hideContainerTasks?: boolean;
  starredOnly?: boolean;  // New filter option
}

// Starred tasks data stored in localStorage and Redis
export interface StarredTasksData {
  taskIds: string[];      // Array of starred task IDs
  lastModified: number;   // Timestamp (Date.now()) of last modification
}

export interface AutoFitResult {
  placements: TaskPlacement[];
  unplacedTasks: GoogleTask[];
  message: string;
}

export interface SaveResult {
  success: boolean;
  savedCount: number;
  errors: string[];
}

// Working hour filter types
export interface WorkingHourFilter {
  searchText?: string;        // Phrase filter (works for list names too)
  starredOnly?: boolean;      // Only starred tasks
  hideContainerTasks?: boolean; // Hide parent tasks
  hasDueDate?: boolean;       // Only tasks with due dates (true/false/undefined)
}

export interface WorkingHourFiltersData {
  filters: Record<string, WorkingHourFilter>;  // Keyed by WorkingHours.id
  lastModified: number;
}

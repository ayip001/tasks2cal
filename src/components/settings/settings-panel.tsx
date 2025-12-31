'use client';

import { useState, useMemo, useEffect } from 'react';
import { UserSettings, GoogleCalendar, GoogleTaskList } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Plus, X, AlertTriangle, RefreshCw, LocateFixed, RotateCcw, Filter } from 'lucide-react';
import { TimezonePicker } from '@/components/settings/timezone-picker';
import { Input } from '@/components/ui/input';
import { requestTimezoneDebugRefresh } from '@/lib/debug-timezone';
import { useTranslations } from '@/hooks/use-translations';
import { useWorkingHourFilters } from '@/hooks/use-working-hour-filters';
import { WorkingHourFilterPanel } from '@/components/settings/working-hour-filter-panel';
import type { Locale } from '@/i18n/config';

interface SettingsPanelProps {
  settings: UserSettings;
  calendars: GoogleCalendar[];
  taskLists?: GoogleTaskList[];
  onSave: (updates: Partial<UserSettings>) => Promise<void>;
  showLabel?: boolean;
  onRefetchCalendars?: () => Promise<void>;
  onRefreshData?: () => Promise<void>;
  triggerClassName?: string;
  triggerVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  locale?: Locale;
  userId?: string;
}

// Convert HH:MM to minutes since midnight
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Format time based on 12h/24h preference
function formatTime(time: string, format: '12h' | '24h'): string {
  const [hours, minutes] = time.split(':').map(Number);
  if (format === '24h') {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function SettingsPanel({
  settings,
  calendars,
  taskLists = [],
  onSave,
  showLabel = false,
  onRefetchCalendars,
  onRefreshData,
  triggerClassName = "",
  triggerVariant,
  locale = 'en',
  userId
}: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [refreshingCalendars, setRefreshingCalendars] = useState(false);
  const [showListColors, setShowListColors] = useState(false);
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [, setForceUpdate] = useState(0);
  const [expandedFilterId, setExpandedFilterId] = useState<string | null>(null);
  const t = useTranslations(locale);

  // Initialize working hour filters hook
  const { filters, getFilter, setFilter, hasFilter } = useWorkingHourFilters(userId);

  // Load last refresh time from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('lastDataRefreshTime');
    if (stored) {
      setLastRefreshTime(new Date(parseInt(stored, 10)));
    }
  }, []);

  // Update relative time display every 30 seconds
  useEffect(() => {
    if (!lastRefreshTime) return;
    const interval = setInterval(() => {
      setForceUpdate((n) => n + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [lastRefreshTime]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(localSettings);
      requestTimezoneDebugRefresh();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshCalendarTimezone = async () => {
    if (!onRefetchCalendars) return;
    setRefreshingCalendars(true);
    try {
      await onRefetchCalendars();
    } finally {
      setRefreshingCalendars(false);
    }
  };

  const handleRefreshData = async () => {
    if (!onRefreshData || hasRefreshed) return;
    setRefreshing(true);
    try {
      await onRefreshData();
      setHasRefreshed(true);
      // Reload timestamp from localStorage (hooks update it when fetching)
      const stored = localStorage.getItem('lastDataRefreshTime');
      if (stored) {
        setLastRefreshTime(new Date(parseInt(stored, 10)));
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Format relative time (e.g., "5 seconds ago", "2 minutes ago")
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return t('settings.secondsAgo', { count: diffSeconds });
    } else if (diffMinutes < 60) {
      return t('settings.minutesAgo', { count: diffMinutes });
    } else if (diffHours < 24) {
      return t('settings.hoursAgo', { count: diffHours });
    } else {
      return t('settings.daysAgo', { count: diffDays });
    }
  };

  // Get the selected calendar's timezone
  const selectedCalendarTimezone = useMemo(() => {
    const selectedCalendar = calendars.find((c) => c.id === localSettings.selectedCalendarId);
    return selectedCalendar?.timeZone || '';
  }, [calendars, localSettings.selectedCalendarId]);

  const updateWorkingHours = (index: number, field: 'start' | 'end', value: string) => {
    const newWorkingHours = [...localSettings.workingHours];
    newWorkingHours[index] = { ...newWorkingHours[index], [field]: value };

    // If changing start time, ensure end time is still valid (after start)
    if (field === 'start') {
      const startMinutes = timeToMinutes(value);
      const endMinutes = timeToMinutes(newWorkingHours[index].end);
      if (endMinutes <= startMinutes) {
        // Set end to 1 hour after start, or 23:45 if that would exceed midnight
        const newEndMinutes = Math.min(startMinutes + 60, 23 * 60 + 45);
        const newEndHours = Math.floor(newEndMinutes / 60);
        const newEndMins = newEndMinutes % 60;
        newWorkingHours[index].end = `${newEndHours.toString().padStart(2, '0')}:${newEndMins.toString().padStart(2, '0')}`;
      }
    }

    setLocalSettings({ ...localSettings, workingHours: newWorkingHours });
  };

  const addWorkingHoursRange = () => {
    const newWorkingHour = {
      id: `wh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      start: '09:00',
      end: '17:00',
    };
    setLocalSettings({
      ...localSettings,
      workingHours: [...localSettings.workingHours, newWorkingHour],
    });
  };

  const removeWorkingHoursRange = (index: number) => {
    const newWorkingHours = localSettings.workingHours.filter((_, i) => i !== index);
    setLocalSettings({ ...localSettings, workingHours: newWorkingHours });
  };

  const colorOptions = [
    { value: '#4285f4', label: t('settings.colorBlue') },
    { value: '#a4bdfc', label: t('settings.colorLavender') },
    { value: '#7ae7bf', label: t('settings.colorSage') },
    { value: '#dbadff', label: t('settings.colorGrape') },
    { value: '#ff887c', label: t('settings.colorFlamingo') },
    { value: '#fbd75b', label: t('settings.colorBanana') },
    { value: '#ffb878', label: t('settings.colorTangerine') },
    { value: '#46d6db', label: t('settings.colorPeacock') },
    { value: '#5484ed', label: t('settings.colorBlueberry') },
    { value: '#51b749', label: t('settings.colorBasil') },
    { value: '#dc2127', label: t('settings.colorTomato') },
  ];

  // Generate hour options for calendar range "from" dropdown
  const hourOptions = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const value = `${i.toString().padStart(2, '0')}:00`;
      return { value, label: formatTime(value, localSettings.timeFormat) };
    });
  }, [localSettings.timeFormat]);

  // Generate hour options for calendar range "to" dropdown (only hours after minTime + 1 hour)
  const hourOptionsAfterMin = useMemo(() => {
    const minMinutes = timeToMinutes(localSettings.slotMinTime);
    const minHourForMax = Math.floor(minMinutes / 60) + 1; // At least 1 hour after
    return Array.from({ length: 24 - minHourForMax }, (_, i) => {
      const hour = minHourForMax + i;
      const value = `${hour.toString().padStart(2, '0')}:00`;
      return { value, label: formatTime(value, localSettings.timeFormat) };
    });
  }, [localSettings.timeFormat, localSettings.slotMinTime]);

  // Generate 15-minute interval options for working hours
  const timeOptions = useMemo(() => {
    return Array.from({ length: 24 * 4 }, (_, i) => {
      const hours = Math.floor(i / 4);
      const minutes = (i % 4) * 15;
      const value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      return { value, label: formatTime(value, localSettings.timeFormat) };
    });
  }, [localSettings.timeFormat]);

  // Get filtered "to" options for a specific working hours entry (only times after start)
  const getEndTimeOptions = (startTime: string) => {
    const startMinutes = timeToMinutes(startTime);
    return timeOptions.filter((option) => timeToMinutes(option.value) > startMinutes);
  };

  // Check if calendar range is valid (at least 1 hour)
  const calendarRangeValid = useMemo(() => {
    const minMinutes = timeToMinutes(localSettings.slotMinTime);
    const maxMinutes = timeToMinutes(localSettings.slotMaxTime);
    return maxMinutes - minMinutes >= 60;
  }, [localSettings.slotMinTime, localSettings.slotMaxTime]);

  // Check which working hours are outside calendar range
  const workingHoursWarnings = useMemo(() => {
    const calendarMin = timeToMinutes(localSettings.slotMinTime);
    const calendarMax = timeToMinutes(localSettings.slotMaxTime);

    return localSettings.workingHours.map((hours, index) => {
      const start = timeToMinutes(hours.start);
      const end = timeToMinutes(hours.end);

      if (start < calendarMin || end > calendarMax) {
        return `Range ${index + 1} (${formatTime(hours.start, localSettings.timeFormat)} - ${formatTime(hours.end, localSettings.timeFormat)}) is outside calendar view`;
      }
      return null;
    }).filter(Boolean);
  }, [localSettings.workingHours, localSettings.slotMinTime, localSettings.slotMaxTime, localSettings.timeFormat]);

  // Handle calendar range change with validation
  const handleSlotMinTimeChange = (value: string) => {
    const newMin = timeToMinutes(value);
    const currentMax = timeToMinutes(localSettings.slotMaxTime);

    // Ensure at least 1 hour gap
    if (currentMax - newMin < 60) {
      // Adjust max time to be 1 hour after new min
      const newMaxHour = Math.min(23, Math.floor(newMin / 60) + 1);
      setLocalSettings({
        ...localSettings,
        slotMinTime: value,
        slotMaxTime: `${newMaxHour.toString().padStart(2, '0')}:00`,
      });
    } else {
      setLocalSettings({ ...localSettings, slotMinTime: value });
    }
  };

  const handleSlotMaxTimeChange = (value: string) => {
    const currentMin = timeToMinutes(localSettings.slotMinTime);
    const newMax = timeToMinutes(value);

    // Ensure at least 1 hour gap
    if (newMax - currentMin < 60) {
      // Adjust min time to be 1 hour before new max
      const newMinHour = Math.max(0, Math.floor(newMax / 60) - 1);
      setLocalSettings({
        ...localSettings,
        slotMinTime: `${newMinHour.toString().padStart(2, '0')}:00`,
        slotMaxTime: value,
      });
    } else {
      setLocalSettings({ ...localSettings, slotMaxTime: value });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant={triggerVariant || (showLabel ? "ghost" : "outline")}
          size={showLabel ? "default" : "icon"}
          className={triggerClassName || (showLabel ? "justify-start w-full" : "")}
        >
          <Settings className="h-4 w-4" />
          {showLabel && <span className="ml-2">{t('settings.title')}</span>}
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('settings.title')}</SheetTitle>
          <SheetDescription>{t('settings.description')}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6 px-6">
          <div className="space-y-2">
            <Label>{t('settings.defaultTaskDuration', { minutes: localSettings.defaultTaskDuration })}</Label>
            <Slider
              value={[localSettings.defaultTaskDuration]}
              onValueChange={([value]) =>
                setLocalSettings({ ...localSettings, defaultTaskDuration: value })
              }
              min={15}
              max={120}
              step={15}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('settings.minGapBetweenTasks', { minutes: localSettings.minTimeBetweenTasks })}</Label>
            <Slider
              value={[localSettings.minTimeBetweenTasks]}
              onValueChange={([value]) =>
                setLocalSettings({ ...localSettings, minTimeBetweenTasks: value })
              }
              min={0}
              max={60}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeFormat">{t('settings.timeFormat')}</Label>
            <Select
              value={localSettings.timeFormat}
              onValueChange={(value: '12h' | '24h') =>
                setLocalSettings({ ...localSettings, timeFormat: value })
              }
            >
              <SelectTrigger id="timeFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">{t('settings.timeFormat12h')}</SelectItem>
                <SelectItem value="24h">{t('settings.timeFormat24h')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taskColor">{t('settings.taskColor')}</Label>
            <div className="flex items-center gap-2">
              <Select
                value={localSettings.taskColor}
                onValueChange={(value) => setLocalSettings({ ...localSettings, taskColor: value })}
              >
                <SelectTrigger id="taskColor" className="flex-1">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: localSettings.taskColor }}
                      />
                      <span>
                        {colorOptions.find((c) => c.value === localSettings.taskColor)?.label ||
                          t('settings.colorCustom')}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        <span>{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {taskLists.length > 0 && !showListColors && (
            <Button variant="ghost" size="sm" onClick={() => setShowListColors(true)}>
              <Plus className="h-4 w-4 mr-1" />
              {t('settings.listColors')}
            </Button>
          )}

          {showListColors && taskLists.length > 0 && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{t('settings.listColors')}</Label>
                <div className="flex items-center gap-1">
                  {Object.keys(localSettings.listColors || {}).length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocalSettings({ ...localSettings, listColors: {} })}
                      className="h-7 text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      {t('settings.resetToDefault')}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowListColors(false)}
                    className="h-7 w-7"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('settings.listColorsDesc')}
              </p>
              <div className="space-y-2">
                {taskLists.map((list) => {
                  const listColor = localSettings.listColors?.[list.id];
                  const displayColor = listColor || localSettings.taskColor;
                  const isCustom = !!listColor;

                  return (
                    <div key={list.id} className="flex items-center gap-2">
                      <span className="text-sm flex-1 truncate" title={list.title}>
                        {list.title}
                      </span>
                      <Select
                        value={listColor || '__default__'}
                        onValueChange={(value) => {
                          const newListColors = { ...(localSettings.listColors || {}) };
                          if (value === '__default__') {
                            delete newListColors[list.id];
                          } else {
                            newListColors[list.id] = value;
                          }
                          setLocalSettings({ ...localSettings, listColors: newListColors });
                        }}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: displayColor }}
                              />
                              <span className="text-xs truncate">
                                {isCustom
                                  ? colorOptions.find((c) => c.value === listColor)?.label || t('settings.colorCustom')
                                  : t('settings.useDefault')}
                              </span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__default__">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: localSettings.taskColor }}
                              />
                              <span className="text-xs">{t('settings.useDefault')}</span>
                            </div>
                          </SelectItem>
                          {colorOptions.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: color.value }}
                                />
                                <span className="text-xs">{color.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="calendar">{t('settings.calendarForEvents')}</Label>
            <Select
              value={localSettings.selectedCalendarId}
              onValueChange={(value) =>
                setLocalSettings({ ...localSettings, selectedCalendarId: value })
              }
            >
              <SelectTrigger id="calendar">
                <SelectValue placeholder={t('settings.selectCalendar')} />
              </SelectTrigger>
              <SelectContent>
                {calendars.map((calendar) => (
                  <SelectItem key={calendar.id} value={calendar.id}>
                    {calendar.summary} {calendar.primary && t('settings.primary')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('settings.calendarTimezone')}</Label>
            <div className="flex items-center gap-2">
              <Input
                value={selectedCalendarTimezone}
                disabled
                className="flex-1 text-muted-foreground"
                placeholder={t('settings.selectCalendar')}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefreshCalendarTimezone}
                disabled={refreshingCalendars || !onRefetchCalendars}
                title={t('settings.refreshTimezone')}
              >
                <RefreshCw className={`h-4 w-4 ${refreshingCalendars ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('settings.calendarTimezoneDesc')}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t('settings.yourTimezone')}</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <TimezonePicker
                  value={localSettings.timezone}
                  onChange={(timezone) => setLocalSettings({ ...localSettings, timezone })}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  try {
                    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    if (detected) {
                      setLocalSettings({ ...localSettings, timezone: detected });
                    }
                  } catch {
                    // Ignore detection errors
                  }
                }}
                title={t('settings.autoDetect')}
              >
                <LocateFixed className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('settings.yourTimezoneDesc')}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t('settings.calendarDayRange')}</Label>
            <div className="flex items-center gap-2">
              <Select
                value={localSettings.slotMinTime || '06:00'}
                onValueChange={(value) =>
                  setLocalSettings({ ...localSettings, slotMinTime: value })
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hourOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>{t('common.to')}</span>
              <Select
                value={localSettings.slotMaxTime || '22:00'}
                onValueChange={(value) =>
                  setLocalSettings({ ...localSettings, slotMaxTime: value })
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hourOptionsAfterMin.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('settings.calendarDayRangeDesc')}
            </p>
            {workingHoursWarnings.length > 0 && (
              <div className="flex items-start gap-2 text-xs text-amber-600 mt-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{t('settings.workingHoursWarning')}</p>
                  <ul className="list-disc list-inside">
                    {workingHoursWarnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('settings.workingHours')}</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('settings.workingHoursDesc')}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={addWorkingHoursRange}>
                <Plus className="h-4 w-4 mr-1" />
                {t('settings.addRange')}
              </Button>
            </div>
            {localSettings.workingHours.map((hours, index) => {
              const hasFilterSet = hasFilter(hours.id);
              const isExpanded = expandedFilterId === hours.id;

              return (
                <div key={hours.id} className="space-y-2">
                  {/* Working hour row */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={hours.start}
                      onValueChange={(value) => updateWorkingHours(index, 'start', value)}
                    >
                      <SelectTrigger className="w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>{t('common.to')}</span>
                    <Select
                      value={hours.end}
                      onValueChange={(value) => updateWorkingHours(index, 'end', value)}
                    >
                      <SelectTrigger className="w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getEndTimeOptions(hours.start).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Filter button with blue dot indicator */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExpandedFilterId(isExpanded ? null : hours.id)}
                      className="relative"
                    >
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      {/* Blue dot indicator when filter is set */}
                      {hasFilterSet && (
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </Button>

                    {/* Remove button */}
                    {localSettings.workingHours.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeWorkingHoursRange(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Inline expandable filter panel */}
                  {isExpanded && (
                    <WorkingHourFilterPanel
                      workingHourId={hours.id}
                      timeRange={`${hours.start}-${hours.end}`}
                      filter={getFilter(hours.id)}
                      onSave={(filter) => setFilter(hours.id, filter)}
                      onClose={() => setExpandedFilterId(null)}
                      timeFormat={localSettings.timeFormat}
                      t={t}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="ignoreContainer"
              checked={localSettings.ignoreContainerTasks}
              onCheckedChange={(checked) =>
                setLocalSettings({ ...localSettings, ignoreContainerTasks: checked === true })
              }
            />
            <Label htmlFor="ignoreContainer" className="cursor-pointer">
              {t('settings.ignoreContainerTasks')}
            </Label>
          </div>

          {onRefreshData && (
            <div className="space-y-2 pt-4 border-t">
              <Label>{t('settings.refreshData')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('settings.refreshDataDesc')}
                {lastRefreshTime && ` ${t('settings.lastRefreshed', { time: formatRelativeTime(lastRefreshTime) })}`}
              </p>
              <Button
                variant="outline"
                onClick={handleRefreshData}
                disabled={refreshing || hasRefreshed}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing
                  ? t('settings.refreshing')
                  : hasRefreshed
                  ? t('settings.refreshDisabled')
                  : t('settings.refreshData')}
              </Button>
            </div>
          )}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? t('settings.saving') : t('settings.saveSettings')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

'use client';

import { useState, useMemo, useEffect } from 'react';
import { UserSettings, GoogleTaskList, WorkingHourFilter, WorkingHours } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, AlertTriangle, Wrench, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/hooks/use-translations';
import { useWorkingHourFilters } from '@/hooks/use-working-hour-filters';
import { WorkingHourFilterPanel } from '@/components/settings/working-hour-filter-panel';
import type { Locale } from '@/i18n/config';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AutofitSettingsPanelProps {
  settings: UserSettings;
  onSave: (updates: Partial<UserSettings>) => Promise<void>;
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

interface SortableWorkingHourProps {
  workingHour: WorkingHours;
  index: number;
  timeFormat: '12h' | '24h';
  timeOptions: Array<{ value: string; label: string }>;
  getEndTimeOptions: (start: string) => Array<{ value: string; label: string }>;
  colorOptions: Array<{ value: string; label: string }>;
  onUpdateField: (id: string, field: keyof WorkingHours, value: string | boolean | undefined) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  hasFilter: (id: string) => boolean;
  getFilter: (id: string) => WorkingHourFilter | undefined;
  onFilterSave: (id: string, filter: WorkingHourFilter | undefined) => void;
  expandedSettingsId: string | null;
  setExpandedSettingsId: (id: string | null) => void;
  recentlySavedFilterId: string | null;
  anyPanelOpen: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
}

function SortableWorkingHour({
  workingHour,
  index,
  timeFormat,
  timeOptions,
  getEndTimeOptions,
  colorOptions,
  onUpdateField,
  onRemove,
  canRemove,
  hasFilter,
  getFilter,
  onFilterSave,
  expandedSettingsId,
  setExpandedSettingsId,
  recentlySavedFilterId,
  anyPanelOpen,
  t,
}: SortableWorkingHourProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: workingHour.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasFilterSet = hasFilter(workingHour.id);
  const hasCustomSettings = !!workingHour.name || !!workingHour.color || workingHour.useColorForTasks || hasFilterSet;
  const isSettingsExpanded = expandedSettingsId === workingHour.id;
  const isRecentlySaved = recentlySavedFilterId === workingHour.id;

  const displayColor = workingHour.color || '#9ca3af'; // Default gray

  return (
    <div ref={setNodeRef} style={style} className="space-y-2">
      {/* Working hour row */}
      <div className="flex items-center gap-2">
        {/* Drag handle - disabled when any panel is open */}
        <button
          {...attributes}
          {...(anyPanelOpen ? {} : listeners)}
          className={anyPanelOpen ? "text-muted-foreground/50 cursor-not-allowed" : "cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Time range selectors with fixed width */}
        <Select
          value={workingHour.start}
          onValueChange={(value) => onUpdateField(workingHour.id, 'start', value)}
        >
          <SelectTrigger className="w-[100px] min-w-[100px]">
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
        <span className="text-sm text-muted-foreground">{t('common.to')}</span>
        <Select
          value={workingHour.end}
          onValueChange={(value) => onUpdateField(workingHour.id, 'end', value)}
        >
          <SelectTrigger className="w-[100px] min-w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getEndTimeOptions(workingHour.start).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Settings button (combined color + filter) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpandedSettingsId(isSettingsExpanded ? null : workingHour.id)}
          className="relative"
        >
          <Wrench className="h-4 w-4 text-muted-foreground" />
          {hasCustomSettings && (
            <span
              className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: displayColor }}
            />
          )}
          {isSettingsExpanded ? (
            <ChevronUp className="absolute -bottom-1 -right-1 h-3 w-3 bg-background rounded-full" />
          ) : (
            <ChevronDown className="absolute -bottom-1 -right-1 h-3 w-3 bg-background rounded-full" />
          )}
        </Button>

        {/* Remove button */}
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(workingHour.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expandable combined settings panel */}
      {isSettingsExpanded && (
        <div className="space-y-3 p-3 bg-muted/50 rounded-lg border ml-6">
          {/* Name and Color section */}
          <div className="space-y-2">
            <Label className="text-sm">{t('autofit.periodName')}</Label>
            <Input
              placeholder={t('autofit.periodNamePlaceholder')}
              value={workingHour.name || ''}
              onChange={(e) => onUpdateField(workingHour.id, 'name', e.target.value || undefined)}
              className="h-8"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">{t('autofit.periodColor')}</Label>
            <Select
              value={workingHour.color || '__default__'}
              onValueChange={(value) => onUpdateField(workingHour.id, 'color', value === '__default__' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: displayColor }}
                    />
                    <span>
                      {workingHour.color
                        ? colorOptions.find((c) => c.value === workingHour.color)?.label || t('settings.colorCustom')
                        : t('settings.useDefault')}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__default__">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: '#9ca3af' }}
                    />
                    <span>{t('settings.useDefault')}</span>
                  </div>
                </SelectItem>
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`useColor-${workingHour.id}`}
              checked={workingHour.useColorForTasks || false}
              onCheckedChange={(checked) => onUpdateField(workingHour.id, 'useColorForTasks', checked === true ? true : undefined)}
            />
            <Label htmlFor={`useColor-${workingHour.id}`} className="text-sm cursor-pointer">
              {t('autofit.useColorForTasks')}
            </Label>
          </div>

          {/* Filter section */}
          <div className="pt-3 border-t">
            <WorkingHourFilterPanel
              workingHourId={workingHour.id}
              filter={getFilter(workingHour.id)}
              onSave={(filter) => onFilterSave(workingHour.id, filter)}
              timeFormat={timeFormat}
              t={t}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function AutofitSettingsPanel({
  settings,
  onSave,
  locale = 'en',
  userId
}: AutofitSettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [initialSettings, setInitialSettings] = useState<UserSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [expandedSettingsId, setExpandedSettingsId] = useState<string | null>(null);
  const [recentlySavedFilterId, setRecentlySavedFilterId] = useState<string | null>(null);
  const t = useTranslations(locale);

  // Initialize working hour filters hook
  const { filters, getFilter, setFilter, hasFilter } = useWorkingHourFilters(userId);

  // Update local and initial settings when settings prop changes
  useEffect(() => {
    setLocalSettings(settings);
    setInitialSettings(settings);
  }, [settings]);

  // Check if settings have changed
  const hasChanges = useMemo(() => {
    // Compare slotMinTime and slotMaxTime
    if (localSettings.slotMinTime !== initialSettings.slotMinTime) return true;
    if (localSettings.slotMaxTime !== initialSettings.slotMaxTime) return true;

    // Compare workingHours array
    if (localSettings.workingHours.length !== initialSettings.workingHours.length) return true;

    // Deep compare each working hour
    for (let i = 0; i < localSettings.workingHours.length; i++) {
      const local = localSettings.workingHours[i];
      const initial = initialSettings.workingHours[i];

      if (local.id !== initial.id) return true;
      if (local.start !== initial.start) return true;
      if (local.end !== initial.end) return true;
      if (local.name !== initial.name) return true;
      if (local.color !== initial.color) return true;
      if (local.useColorForTasks !== initial.useColorForTasks) return true;
    }

    return false;
  }, [localSettings, initialSettings]);

  // Handle filter save with visual feedback
  const handleFilterSave = (workingHourId: string, filter: WorkingHourFilter | undefined) => {
    setFilter(workingHourId, filter);
    setRecentlySavedFilterId(workingHourId);
    setTimeout(() => {
      setRecentlySavedFilterId(null);
    }, 1000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(localSettings);
    } finally {
      setSaving(false);
    }
  };

  const updateWorkingHourField = (id: string, field: keyof WorkingHours, value: string | boolean | undefined) => {
    const newWorkingHours = localSettings.workingHours.map(wh => {
      if (wh.id !== id) return wh;

      const updated = { ...wh, [field]: value };

      // If changing start time, ensure end time is still valid (after start)
      if (field === 'start' && typeof value === 'string') {
        const startMinutes = timeToMinutes(value);
        const endMinutes = timeToMinutes(updated.end);
        if (endMinutes <= startMinutes) {
          const newEndMinutes = Math.min(startMinutes + 60, 23 * 60 + 45);
          const newEndHours = Math.floor(newEndMinutes / 60);
          const newEndMins = newEndMinutes % 60;
          updated.end = `${newEndHours.toString().padStart(2, '0')}:${newEndMins.toString().padStart(2, '0')}`;
        }
      }

      return updated;
    });

    setLocalSettings({ ...localSettings, workingHours: newWorkingHours });
  };

  const addWorkingHoursRange = () => {
    const newWorkingHour: WorkingHours = {
      id: `wh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      start: '09:00',
      end: '17:00',
    };
    setLocalSettings({
      ...localSettings,
      workingHours: [...localSettings.workingHours, newWorkingHour],
    });
  };

  const removeWorkingHoursRange = (id: string) => {
    const newWorkingHours = localSettings.workingHours.filter((wh) => wh.id !== id);
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
    const minHourForMax = Math.floor(minMinutes / 60) + 1;
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

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localSettings.workingHours.findIndex((wh) => wh.id === active.id);
      const newIndex = localSettings.workingHours.findIndex((wh) => wh.id === over.id);

      const newWorkingHours = arrayMove(localSettings.workingHours, oldIndex, newIndex);
      setLocalSettings({ ...localSettings, workingHours: newWorkingHours });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Calendar Day Range */}
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
            <span className="text-sm text-muted-foreground">{t('common.to')}</span>
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

        {/* Working Hours */}
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

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localSettings.workingHours.map((wh) => wh.id)}
              strategy={verticalListSortingStrategy}
            >
              {localSettings.workingHours.map((workingHour, index) => (
                <SortableWorkingHour
                  key={workingHour.id}
                  workingHour={workingHour}
                  index={index}
                  timeFormat={localSettings.timeFormat}
                  timeOptions={timeOptions}
                  getEndTimeOptions={getEndTimeOptions}
                  colorOptions={colorOptions}
                  onUpdateField={updateWorkingHourField}
                  onRemove={removeWorkingHoursRange}
                  canRemove={localSettings.workingHours.length > 1}
                  hasFilter={hasFilter}
                  getFilter={getFilter}
                  onFilterSave={handleFilterSave}
                  expandedSettingsId={expandedSettingsId}
                  setExpandedSettingsId={setExpandedSettingsId}
                  recentlySavedFilterId={recentlySavedFilterId}
                  anyPanelOpen={expandedSettingsId !== null}
                  t={t}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Save Button - Sticky at bottom */}
      <div className="p-4 border-t bg-background">
        <Button onClick={handleSave} disabled={saving || !hasChanges} className="w-full">
          {saving ? t('settings.saving') : t('settings.saveSettings')}
        </Button>
      </div>
    </div>
  );
}

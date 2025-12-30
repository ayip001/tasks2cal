'use client';

import { useState, useEffect } from 'react';
import { WorkingHourFilter } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, RotateCcw } from 'lucide-react';
import type { Locale } from '@/i18n/config';

interface WorkingHourFilterPanelProps {
  workingHourId: string;
  timeRange: string; // For display only (e.g., "11:00-12:15")
  filter: WorkingHourFilter | undefined;
  onSave: (filter: WorkingHourFilter | undefined) => void;
  onClose: () => void;
  timeFormat: '12h' | '24h';
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function WorkingHourFilterPanel({
  workingHourId,
  timeRange,
  filter,
  onSave,
  onClose,
  timeFormat,
  t,
}: WorkingHourFilterPanelProps) {
  const [localFilter, setLocalFilter] = useState<WorkingHourFilter>(filter || {});

  // Update local filter when prop changes
  useEffect(() => {
    setLocalFilter(filter || {});
  }, [filter]);

  // Check if any filter values are set
  const hasAnyFilterValue =
    !!localFilter.searchText ||
    !!localFilter.starredOnly ||
    !!localFilter.hideContainerTasks ||
    localFilter.hasDueDate !== undefined;

  const handleClearFilter = () => {
    setLocalFilter({});
    onSave(undefined);
  };

  const handleSave = () => {
    // Only save if there are actual filter values
    if (hasAnyFilterValue) {
      onSave(localFilter);
    } else {
      onSave(undefined);
    }
  };

  // Format time range for display
  const formatTimeRange = (range: string): string => {
    const [start, end] = range.split('-');
    if (timeFormat === '24h') {
      return `${start} - ${end}`;
    }
    // Convert to 12h format
    const formatTime = (time: string): string => {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  return (
    <div className="space-y-3 p-3 bg-muted/50 rounded-lg border ml-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {t('settings.filterFor', { time: formatTimeRange(timeRange) })}
        </Label>
        <div className="flex items-center gap-1">
          {hasAnyFilterValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilter}
              className="h-7 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              {t('settings.clearFilter')}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground">{t('settings.workingHourFilterDesc')}</p>

      {/* Search phrase input */}
      <div className="space-y-1">
        <Label className="text-xs">{t('tasks.searchPlaceholder')}</Label>
        <Input
          placeholder={t('tasks.searchPlaceholder')}
          value={localFilter.searchText || ''}
          onChange={(e) =>
            setLocalFilter({ ...localFilter, searchText: e.target.value || undefined })
          }
          onBlur={handleSave}
          className="h-8 text-sm"
        />
      </div>

      {/* Due date filter */}
      <div className="space-y-1">
        <Label className="text-xs">{t('tasks.dueDate')}</Label>
        <Select
          value={
            localFilter.hasDueDate === undefined
              ? 'all'
              : localFilter.hasDueDate
              ? 'has'
              : 'none'
          }
          onValueChange={(value) => {
            const newFilter = {
              ...localFilter,
              hasDueDate: value === 'all' ? undefined : value === 'has',
            };
            setLocalFilter(newFilter);
            handleSave();
          }}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('tasks.all')}</SelectItem>
            <SelectItem value="has">{t('tasks.hasDueDate')}</SelectItem>
            <SelectItem value="none">{t('tasks.noDueDate')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Checkbox options */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`starred-${workingHourId}`}
            checked={localFilter.starredOnly || false}
            onCheckedChange={(checked) => {
              const newFilter = {
                ...localFilter,
                starredOnly: checked ? true : undefined,
              };
              setLocalFilter(newFilter);
              handleSave();
            }}
          />
          <Label htmlFor={`starred-${workingHourId}`} className="text-sm cursor-pointer">
            {t('tasks.favoritesOnly')}
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id={`hideContainer-${workingHourId}`}
            checked={localFilter.hideContainerTasks || false}
            onCheckedChange={(checked) => {
              const newFilter = {
                ...localFilter,
                hideContainerTasks: checked ? true : undefined,
              };
              setLocalFilter(newFilter);
              handleSave();
            }}
          />
          <Label htmlFor={`hideContainer-${workingHourId}`} className="text-sm cursor-pointer">
            {t('tasks.hideContainers')}
          </Label>
        </div>
      </div>
    </div>
  );
}

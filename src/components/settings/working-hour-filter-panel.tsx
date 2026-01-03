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
  filter: WorkingHourFilter | undefined;
  onSave: (filter: WorkingHourFilter | undefined) => void;
  timeFormat: '12h' | '24h';
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function WorkingHourFilterPanel({
  workingHourId,
  filter,
  onSave,
  timeFormat,
  t,
}: WorkingHourFilterPanelProps) {
  // Initialize with hideContainerTasks: true by default if no filter exists
  const [localFilter, setLocalFilter] = useState<WorkingHourFilter>(
    filter || { hideContainerTasks: true }
  );

  // Update local filter when prop changes
  useEffect(() => {
    setLocalFilter(filter || { hideContainerTasks: true });
  }, [filter]);

  // Helper to update filter and save immediately
  const updateFilter = (updates: Partial<WorkingHourFilter>) => {
    const newFilter = { ...localFilter, ...updates };
    setLocalFilter(newFilter);

    // Check if any filter values are set
    const hasAnyFilterValue =
      !!newFilter.searchText ||
      !!newFilter.starredOnly ||
      !!newFilter.hideContainerTasks ||
      newFilter.hasDueDate !== undefined;

    // Save immediately (only save if there are actual filter values)
    onSave(hasAnyFilterValue ? newFilter : undefined);
  };

  const handleClearFilter = () => {
    setLocalFilter({});
    onSave(undefined);
  };

  // Check if any filter values are set
  const hasAnyFilterValue =
    !!localFilter.searchText ||
    !!localFilter.starredOnly ||
    !!localFilter.hideContainerTasks ||
    localFilter.hasDueDate !== undefined;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {t('settings.customFilters')}
        </Label>
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
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground">{t('settings.workingHourFilterDesc')}</p>

      {/* Search phrase input */}
      <div className="space-y-1">
        <Label className="text-xs">{t('tasks.searchPlaceholder')}</Label>
        <Input
          placeholder={t('tasks.searchPlaceholder')}
          value={localFilter.searchText || ''}
          onChange={(e) => updateFilter({ searchText: e.target.value || undefined })}
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
            updateFilter({
              hasDueDate: value === 'all' ? undefined : value === 'has',
            });
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
              updateFilter({ starredOnly: checked ? true : undefined });
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
              updateFilter({ hideContainerTasks: checked ? true : undefined });
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

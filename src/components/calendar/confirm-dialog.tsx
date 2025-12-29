'use client';

import { TaskPlacement } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useTranslations } from '@/hooks/use-translations';
import type { Locale } from '@/i18n/config';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placements: TaskPlacement[];
  onConfirm: () => void;
  saving: boolean;
  taskColor: string;
  listColors?: Record<string, string>;
  locale?: Locale;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  placements,
  onConfirm,
  saving,
  taskColor,
  listColors,
  locale = 'en',
}: ConfirmDialogProps) {
  const t = useTranslations(locale);

  // Get the color for a placement based on listId or default
  const getPlacementColor = (listId?: string) => {
    if (listId && listColors?.[listId]) {
      return listColors[listId];
    }
    return taskColor;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('day.saveToCalendar')}</DialogTitle>
          <DialogDescription>
            {t('day.saveToCalendarDescription', { count: placements.length })}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-60 mt-4">
          <ul className="space-y-3">
            {placements.map((placement) => (
              <li key={placement.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getPlacementColor(placement.listId) }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{placement.taskTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(placement.startTime), 'h:mm a')} - {placement.duration} min
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onConfirm} disabled={saving}>
            {saving ? t('settings.saving') : t('day.confirmAndSave')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

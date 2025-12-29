'use client';

import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { Draggable } from '@fullcalendar/interaction';
import { GoogleTask, GoogleTaskList, TaskFilter, TaskPlacement } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Calendar, GripVertical, Check, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslations } from '@/hooks/use-translations';
import type { Locale } from '@/i18n/config';

interface TaskPanelProps {
  taskLists: GoogleTaskList[];
  placements: TaskPlacement[];
  loading: boolean;
  filter: TaskFilter;
  onFilterChange: Dispatch<SetStateAction<TaskFilter>>;
  filteredTasks: GoogleTask[];
  onAddTask?: (task: GoogleTask) => void;
  isMobile?: boolean;
  locale?: Locale;
}

export function TaskPanel({
  taskLists,
  placements,
  loading,
  filter,
  onFilterChange,
  filteredTasks,
  onAddTask,
  isMobile = false,
  locale = 'en',
}: TaskPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const placedTaskIds = new Set(placements.map((p) => p.taskId));
  const t = useTranslations(locale);

  const setFilter = onFilterChange;

  // Initialize FullCalendar Draggable for external drag and drop (desktop only)
  useEffect(() => {
    if (containerRef.current && !isMobile) {
      const draggable = new Draggable(containerRef.current, {
        itemSelector: '[data-task-id]',
        eventData: (eventEl) => {
          return {
            title: eventEl.dataset.taskTitle || 'Task',
            duration: '00:30', // Default duration, actual duration set by settings on drop
          };
        },
      });

      return () => {
        draggable.destroy();
      };
    }
  }, [isMobile]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('tasks.searchPlaceholder')}
            className="pl-9"
            value={filter.searchText || ''}
            onChange={(e) => setFilter({ ...filter, searchText: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="list-filter">{t('tasks.list')}</Label>
            <Select
              value={filter.listId || 'all'}
              onValueChange={(value) => setFilter({ ...filter, listId: value === 'all' ? undefined : value })}
            >
              <SelectTrigger id="list-filter">
                <SelectValue placeholder={t('tasks.allLists')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tasks.allLists')}</SelectItem>
                {taskLists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due-filter">{t('tasks.dueDate')}</Label>
            <Select
              value={filter.hasDueDate === undefined ? 'all' : filter.hasDueDate ? 'has' : 'none'}
              onValueChange={(value) =>
                setFilter({
                  ...filter,
                  hasDueDate: value === 'all' ? undefined : value === 'has',
                })
              }
            >
              <SelectTrigger id="due-filter">
                <SelectValue placeholder={t('tasks.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tasks.all')}</SelectItem>
                <SelectItem value="has">{t('tasks.hasDueDate')}</SelectItem>
                <SelectItem value="none">{t('tasks.noDueDate')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="hideContainer"
            checked={filter.hideContainerTasks || false}
            onCheckedChange={(checked) =>
              setFilter({ ...filter, hideContainerTasks: checked ? true : undefined })
            }
          />
          <Label htmlFor="hideContainer" className="text-sm cursor-pointer">
            {t('tasks.hideContainers')}
          </Label>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div ref={containerRef} className="p-4 space-y-2">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">{t('tasks.loadingTasks')}</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">{t('tasks.noTasksFound')}</div>
          ) : (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isPlaced={placedTaskIds.has(task.id)}
                onAddTask={onAddTask}
                isMobile={isMobile}
                locale={locale}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface TaskItemProps {
  task: GoogleTask;
  isPlaced: boolean;
  onAddTask?: (task: GoogleTask) => void;
  isMobile?: boolean;
  locale?: Locale;
}

function TaskItem({ task, isPlaced, onAddTask, isMobile = false, locale = 'en' }: TaskItemProps) {
  const t = useTranslations(locale);
  return (
    <div
      data-task-id={task.id}
      data-task-title={task.title}
      data-task-list-title={task.listTitle}
      className={`flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors fc-event ${
        isMobile ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      {!isMobile && <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{task.title}</span>
          {isPlaced && (
            <Badge variant="secondary" className="flex-shrink-0">
              <Check className="h-3 w-3 mr-1" />
              {t('tasks.placed')}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>{task.listTitle}</span>
          {task.due && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(task.due), 'MMM d')}
              </span>
            </>
          )}
          {task.hasSubtasks && (
            <>
              <span>•</span>
              <span>{t('tasks.hasSubtasks')}</span>
            </>
          )}
        </div>
      </div>

      {isMobile && onAddTask && (
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-8 w-8"
          onClick={() => onAddTask(task)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

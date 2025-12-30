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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Calendar, GripVertical, Check, Plus, ChevronDown, Star } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslations } from '@/hooks/use-translations';
import type { Locale } from '@/i18n/config';
import { TaskItemSkeleton } from '@/components/ui/loading-skeletons';

interface TaskPanelProps {
  taskLists: GoogleTaskList[];
  placements: TaskPlacement[];
  loading: boolean;
  filter: TaskFilter;
  onFilterChange: Dispatch<SetStateAction<TaskFilter>>;
  filteredTasks: GoogleTask[];
  onAddTask?: (task: GoogleTask) => void;
  onToggleStar?: (taskId: string) => void;
  isMobile?: boolean;
  locale?: Locale;
  taskColor?: string;
  listColors?: Record<string, string>;
}

export function TaskPanel({
  taskLists,
  placements,
  loading,
  filter,
  onFilterChange,
  filteredTasks,
  onAddTask,
  onToggleStar,
  isMobile = false,
  locale = 'en',
  taskColor = '#4285f4',
  listColors,
}: TaskPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const placedTaskIds = new Set(placements.map((p) => p.taskId));
  const t = useTranslations(locale);

  // Get the color for a task based on its listId
  const getTaskColor = (listId: string) => {
    if (listColors?.[listId]) {
      return listColors[listId];
    }
    return taskColor;
  };

  const setFilter = onFilterChange;

  const selectedListIds = filter.listIds ?? [];
  const allListIds = taskLists.map((list) => list.id);
  const allListsSelected = filter.listIds === undefined || (allListIds.length > 0 && selectedListIds.length === allListIds.length);
  const noListsSelected = selectedListIds.length === 0 && filter.listIds !== undefined;

  const handleAllListsToggle = () => {
    if (allListsSelected) {
      setFilter({ ...filter, listIds: [] });
    } else {
      setFilter({ ...filter, listIds: allListIds.length > 0 ? allListIds : undefined });
    }
  };

  const handleListToggle = (listId: string) => {
    const currentListIds = filter.listIds ?? [];
    if (currentListIds.includes(listId)) {
      const newListIds = currentListIds.filter((id) => id !== listId);
      setFilter({ ...filter, listIds: newListIds.length > 0 ? newListIds : [] });
    } else {
      setFilter({ ...filter, listIds: [...currentListIds, listId] });
    }
  };

  const getListFilterDisplayText = () => {
    if (filter.listIds === undefined || allListsSelected) {
      return t('tasks.allLists');
    }
    if (noListsSelected) {
      return t('tasks.noListSelected');
    }
    if (selectedListIds.length === 1) {
      const selectedList = taskLists.find((list) => list.id === selectedListIds[0]);
      return selectedList?.title || t('tasks.allLists');
    }
    return t('tasks.listsSelected', { count: selectedListIds.length });
  };

  // Initialize FullCalendar Draggable for external drag and drop (desktop only)
  useEffect(() => {
    if (containerRef.current && !isMobile) {
      const draggable = new Draggable(containerRef.current, {
        itemSelector: '[data-task-id]',
        eventData: (eventEl) => {
          const color = eventEl.dataset.taskColor || taskColor;
          return {
            title: eventEl.dataset.taskTitle || 'Task',
            duration: '00:30', // Default duration, actual duration set by settings on drop
            backgroundColor: color,
            borderColor: color,
          };
        },
      });

      return () => {
        draggable.destroy();
      };
    }
  }, [isMobile, taskColor]);

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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="list-filter"
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  <span className="truncate">{getListFilterDisplayText()}</span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="start">
                <div className="p-2 space-y-1">
                  <div className="flex items-center space-x-2 p-2 rounded-sm hover:bg-accent cursor-pointer">
                    <Checkbox
                      id="all-lists"
                      checked={allListsSelected}
                      onCheckedChange={handleAllListsToggle}
                    />
                    <Label
                      htmlFor="all-lists"
                      className="text-sm font-medium cursor-pointer flex-1 break-words"
                    >
                      {t('tasks.allLists')}
                    </Label>
                  </div>
                  {taskLists.map((list) => {
                    const isSelected = filter.listIds === undefined || selectedListIds.includes(list.id);
                    const handleClick = () => handleListToggle(list.id);
                    return (
                      <div
                        key={list.id}
                        className="flex items-center space-x-2 p-2 rounded-sm hover:bg-accent cursor-pointer flex-wrap"
                        onClick={handleClick}
                      >
                        <Checkbox
                          id={`list-${list.id}`}
                          checked={isSelected}
                          onCheckedChange={handleClick}
                        />
                        <Label
                          className="text-sm cursor-pointer flex-1 break-words"
                        >
                          {list.title}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
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

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hideContainer"
              checked={filter.hideContainerTasks || false}
              onCheckedChange={(checked) =>
                setFilter({ ...filter, hideContainerTasks: checked ? true : undefined })
              }
            />
            <Label htmlFor="hideContainer" className="text-sm cursor-pointer break-words">
              {t('tasks.hideContainers')}
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="starredOnly"
              checked={filter.starredOnly || false}
              onCheckedChange={(checked) =>
                setFilter({ ...filter, starredOnly: checked ? true : undefined })
              }
            />
            <Label htmlFor="starredOnly" className="text-sm cursor-pointer break-words">
              {t('tasks.favoritesOnly')}
            </Label>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div ref={containerRef} className="p-4 space-y-2">
          {loading ? (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <TaskItemSkeleton key={i} />
              ))}
            </>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">{t('tasks.noTasksFound')}</div>
          ) : (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isPlaced={placedTaskIds.has(task.id)}
                onAddTask={onAddTask}
                onToggleStar={onToggleStar}
                isMobile={isMobile}
                locale={locale}
                color={getTaskColor(task.listId)}
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
  onToggleStar?: (taskId: string) => void;
  isMobile?: boolean;
  locale?: Locale;
  color?: string;
}

function TaskItem({ task, isPlaced, onAddTask, onToggleStar, isMobile = false, locale = 'en', color = '#4285f4' }: TaskItemProps) {
  const t = useTranslations(locale);
  return (
    <div
      data-task-id={task.id}
      data-task-title={task.title}
      data-task-list-id={task.listId}
      data-task-list-title={task.listTitle}
      data-task-color={color}
      className={`flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors fc-event ${
        isMobile ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      {!isMobile && <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleStar?.(task.id);
        }}
        className="flex-shrink-0"
        title={task.isStarred ? t('tasks.unstar') : t('tasks.star')}
      >
        {task.isStarred ? (
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        ) : (
          <Star className="h-4 w-4 text-muted-foreground hover:text-yellow-500" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <span className="font-medium break-words">{task.title}</span>
          {isPlaced && (
            <Badge variant="secondary" className="flex-shrink-0">
              <Check className="h-3 w-3 mr-1" />
              {t('tasks.placed')}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
          <span className="break-words">{task.listTitle}</span>
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

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { DateTime } from 'luxon';

import { DayCalendar } from '@/components/calendar/day-calendar';
import { TaskPanel } from '@/components/tasks/task-panel';
import { SettingsPanel } from '@/components/settings/settings-panel';
import { ConfirmDialog } from '@/components/calendar/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/ui/footer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useTasks,
  useCalendarEvents,
  useCalendars,
  useSettings,
  usePlacements,
  useAutoFit,
  filterTasks,
} from '@/hooks/use-data';
import { TaskPlacement, TaskFilter, GoogleTask } from '@/types';
import { TIME_SLOT_INTERVAL } from '@/lib/constants';
import { useTranslations, getDateLocale } from '@/hooks/use-translations';
import { normalizeIanaTimeZone, wallTimeOnDateToUtc } from '@/lib/timezone';
import {
  Calendar,
  LogOut,
  User,
  Wand2,
  Save,
  Trash2,
  CalendarDays,
  ListTodo,
} from 'lucide-react';

export default function DayPage() {
  const params = useParams();
  const dateParam = params.date as string;
  const router = useRouter();
  const { data: session, status } = useSession();

  const [filter, setFilter] = useState<TaskFilter>({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mobileView, setMobileView] = useState<'calendar' | 'tasks'>('calendar');

  const { tasks, taskLists, loading: tasksLoading } = useTasks();
  const { settings, loading: settingsLoading, updateSettings, locale } = useSettings();
  const t = useTranslations(locale);
  const dateLocale = getDateLocale(locale);
  const { calendars, refetch: refetchCalendars } = useCalendars();
  const selectedTimeZone = useMemo(() => {
    const tz =
      settings.timezone ??
      calendars.find((c) => c.id === settings.selectedCalendarId)?.timeZone ??
      'UTC';
    return normalizeIanaTimeZone(tz);
  }, [settings.timezone, settings.selectedCalendarId, calendars]);
  const {
    events,
    refetch: refetchEvents,
  } = useCalendarEvents(dateParam, settings.selectedCalendarId, selectedTimeZone);
  const {
    placements,
    addPlacement,
    updatePlacement,
    removePlacement,
    clearPlacements,
    setPlacements,
  } = usePlacements(dateParam);
  const { runAutoFit, loading: autoFitLoading } = useAutoFit();

  // Sync hideContainerTasks with settings
  useEffect(() => {
    setFilter((prev) => ({ ...prev, hideContainerTasks: settings.ignoreContainerTasks }));
  }, [settings.ignoreContainerTasks]);

  // Initialize listIds with all lists when taskLists are loaded
  useEffect(() => {
    if (taskLists.length > 0 && filter.listIds === undefined) {
      const allListIds = taskLists.map((list) => list.id);
      setFilter((prev) => ({ ...prev, listIds: allListIds }));
    }
  }, [taskLists, filter.listIds]);

  // Compute filtered tasks from filter state
  const filteredTasks = useMemo(() => filterTasks(tasks, filter), [tasks, filter]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(dateParam) && DateTime.fromISO(dateParam).isValid;
  const viewedDayInSelectedZone = useMemo(
    () => DateTime.fromISO(dateParam, { zone: selectedTimeZone }),
    [dateParam, selectedTimeZone]
  );

  if (!isValidDate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('day.invalidDate')}</h1>
          <Button onClick={() => router.push('/dashboard')}>{t('day.goBack')}</Button>
        </div>
      </div>
    );
  }

  if (status === 'loading' || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const navigateDay = (direction: 'prev' | 'next') => {
    const next = viewedDayInSelectedZone.plus({ days: direction === 'prev' ? -1 : 1 }).toISODate();
    if (next) {
      router.push(`/day/${next}`);
    }
  };

  const handlePlacementDrop = async (placementId: string, newStartTime: string) => {
    try {
      await updatePlacement(placementId, { startTime: newStartTime });
    } catch {
      toast.error(t('day.failedToUpdate'));
    }
  };

  const handleExternalDrop = async (taskId: string, taskTitle: string, startTime: string, listTitle?: string) => {
    try {
      const newPlacement: TaskPlacement = {
        id: `${taskId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        taskId,
        taskTitle,
        listTitle,
        startTime,
        duration: settings.defaultTaskDuration,
      };

      await addPlacement(newPlacement);
      toast.success(t('day.addedToCalendar', { title: taskTitle }));
    } catch {
      toast.error(t('day.failedToAdd'));
    }
  };

  const handlePlacementClick = async (placementId: string) => {
    try {
      await removePlacement(placementId);
      toast.success(t('day.placementRemoved'));
    } catch {
      toast.error(t('day.failedToRemove'));
    }
  };

  const handleAutoFit = async () => {
    if (filteredTasks.length === 0) {
      toast.error(t('day.noTasksToAutoFit'));
      return;
    }

    try {
      const calendarTimeZone = calendars.find((c) => c.id === settings.selectedCalendarId)?.timeZone;

      const result = await runAutoFit(dateParam, filteredTasks, selectedTimeZone, calendarTimeZone);
      setPlacements(result.allPlacements);
      toast.success(result.message);
    } catch {
      toast.error(t('day.failedAutoFit'));
    }
  };

  // Handle adding a single task via + button (mobile)
  const handleAddTask = async (task: GoogleTask) => {
    try {
      // Try to auto-fit this single task
      const calendarTimeZone = calendars.find((c) => c.id === settings.selectedCalendarId)?.timeZone;

      const result = await runAutoFit(dateParam, [task], selectedTimeZone, calendarTimeZone);

      if (result.placements.length > 0) {
        // Task was placed in working hours
        setPlacements(result.allPlacements);
        toast.success(t('day.addedToCalendar', { title: task.title }));
        setMobileView('calendar'); // Switch to calendar view to show result
      } else {
        // No working hours slot available, try to find any available slot
        // Calculate all busy times from events and existing placements
        const busySlots: { start: Date; end: Date }[] = [];

        // Add existing events as busy
        events.forEach((event) => {
          if (event.start.dateTime && event.end.dateTime) {
            busySlots.push({
              start: new Date(event.start.dateTime),
              end: new Date(event.end.dateTime),
            });
          }
        });

        // Add existing placements as busy
        placements.forEach((p) => {
          busySlots.push({
            start: new Date(p.startTime),
            end: new Date(new Date(p.startTime).getTime() + p.duration * 60 * 1000),
          });
        });

        // Sort busy slots by start time
        busySlots.sort((a, b) => a.start.getTime() - b.start.getTime());

        // Find first available slot in calendar range
        const slotMinTime = settings.slotMinTime || '06:00';
        const slotMaxTime = settings.slotMaxTime || '22:00';
        const calendarStart = wallTimeOnDateToUtc(dateParam, slotMinTime, selectedTimeZone);
        const calendarEnd = wallTimeOnDateToUtc(dateParam, slotMaxTime, selectedTimeZone);
        const taskDuration = settings.defaultTaskDuration * 60 * 1000;

        let foundSlot: Date | null = null;
        const isTodayInSelectedZone = DateTime.now().setZone(selectedTimeZone).toISODate() === dateParam;
        const startMs = isTodayInSelectedZone
          ? Math.max(calendarStart.getTime(), Date.now())
          : calendarStart.getTime();
        const intervalMs = TIME_SLOT_INTERVAL * 60 * 1000;
        let currentTimeMs = Math.ceil(startMs / intervalMs) * intervalMs;

        while (currentTimeMs + taskDuration <= calendarEnd.getTime()) {
          const slotStart = new Date(currentTimeMs);
          const slotEnd = new Date(currentTimeMs + taskDuration);

          // Check if this slot overlaps with any busy slot
          const hasConflict = busySlots.some((busy) => {
            return slotStart < busy.end && slotEnd > busy.start;
          });

          if (!hasConflict) {
            foundSlot = slotStart;
            break;
          }

          currentTimeMs += intervalMs;
        }

        if (foundSlot) {
          const newPlacement: TaskPlacement = {
            id: `${task.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            taskId: task.id,
            taskTitle: task.title,
            listTitle: task.listTitle,
            startTime: foundSlot.toISOString(),
            duration: settings.defaultTaskDuration,
          };

          await addPlacement(newPlacement);
          toast.success(t('day.addedToCalendar', { title: task.title }));
          setMobileView('calendar');
        } else {
          toast.error(t('day.noAvailableSlots'));
        }
      }
    } catch {
      toast.error(t('day.failedToAdd'));
    }
  };

  const handleSaveToCalendar = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarId: settings.selectedCalendarId,
          placements,
          taskColor: settings.taskColor,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save events');
      }

      const result = await response.json();

      await clearPlacements();
      await refetchEvents();

      setConfirmDialogOpen(false);
      toast.success(t('day.savedEvents', { count: result.savedCount }));

      if (result.errors.length > 0) {
        toast.error(t('day.eventsFailed', { count: result.errors.length }));
      }
    } catch {
      toast.error(t('day.failedToSave'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          {/* Mobile: Back button */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="md:hidden">
              <Calendar className="h-5 w-5" />
            </Button>
            <Button variant="ghost" onClick={() => router.push('/dashboard')} className="gap-2 hidden md:flex">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">{t('common.backToCalendar')}</span>
            </Button>
          </div>

          {/* Action buttons (unified for mobile and desktop) */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAutoFit}
              disabled={autoFitLoading || filteredTasks.length === 0}
              className="md:w-auto md:px-3 md:border md:border-input md:bg-background md:hover:bg-accent"
            >
              <Wand2 className="h-5 w-5 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden md:inline">{t('day.autoFit')}</span>
            </Button>

            {placements.length > 0 && (
              <>
                <Button 
                  size="sm" 
                  onClick={() => setConfirmDialogOpen(true)}
                  className="h-9 px-2 md:h-9 md:px-4 md:py-2"
                >
                  <Save className="h-4 w-4 md:mr-2" />
                  <span className="ml-1 md:ml-0">
                    <span className="hidden md:inline">Save </span>
                    ({placements.length})
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setClearConfirmOpen(true)}
                  className="text-destructive hover:text-destructive md:w-auto md:px-3 md:border md:border-input md:bg-background"
                >
                  <Trash2 className="h-5 w-5 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden md:inline">{t('common.clear')}</span>
                </Button>
              </>
            )}

            <SettingsPanel
              settings={settings}
              calendars={calendars}
              onSave={updateSettings}
              onRefetchCalendars={refetchCalendars}
              triggerVariant="ghost"
              triggerClassName="md:border md:border-input md:bg-background md:hover:bg-accent"
              locale={locale}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5 md:h-4 md:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('common.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile: Tab switcher */}
      <div className="md:hidden border-b flex">
        <button
          onClick={() => setMobileView('calendar')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
            mobileView === 'calendar'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          {t('day.calendar')}
        </button>
        <button
          onClick={() => setMobileView('tasks')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
            mobileView === 'tasks'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          <ListTodo className="h-4 w-4" />
          {t('day.tasks')}
        </button>
      </div>

      {/* Desktop: Split view */}
      <main className="flex-1 hidden md:flex overflow-hidden">
        <div className="flex-1 border-r p-4 overflow-hidden">
          <DayCalendar
            date={dateParam}
            events={events}
            placements={placements}
            onPlacementDrop={handlePlacementDrop}
            onExternalDrop={handleExternalDrop}
            onPlacementClick={handlePlacementClick}
            onPastTimeDrop={() => toast.error(t('day.cannotPlacePast'))}
            onNavigate={navigateDay}
            settings={settings}
            selectedTimeZone={settings.timezone ?? calendars.find((c) => c.id === settings.selectedCalendarId)?.timeZone ?? 'UTC'}
            calendarTimeZone={calendars.find((c) => c.id === settings.selectedCalendarId)?.timeZone}
            locale={locale}
          />
        </div>

        <div className="w-96 flex-shrink-0 overflow-hidden">
          <TaskPanel
            taskLists={taskLists}
            placements={placements}
            loading={tasksLoading}
            filter={filter}
            onFilterChange={setFilter}
            filteredTasks={filteredTasks}
            locale={locale}
          />
        </div>
      </main>

      {/* Mobile: Tab content - same layout as desktop */}
      <main className="flex-1 md:hidden flex overflow-hidden">
        {mobileView === 'calendar' ? (
          <div className="flex-1 p-4 overflow-hidden">
            <DayCalendar
              date={dateParam}
              events={events}
              placements={placements}
              onPlacementDrop={handlePlacementDrop}
              onExternalDrop={handleExternalDrop}
              onPlacementClick={handlePlacementClick}
              onPastTimeDrop={() => toast.error(t('day.cannotPlacePast'))}
              onNavigate={navigateDay}
              settings={settings}
              selectedTimeZone={settings.timezone ?? calendars.find((c) => c.id === settings.selectedCalendarId)?.timeZone ?? 'UTC'}
              calendarTimeZone={calendars.find((c) => c.id === settings.selectedCalendarId)?.timeZone}
              locale={locale}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <TaskPanel
              taskLists={taskLists}
              placements={placements}
              loading={tasksLoading}
              filter={filter}
              onFilterChange={setFilter}
              filteredTasks={filteredTasks}
              onAddTask={handleAddTask}
              isMobile={true}
              locale={locale}
            />
          </div>
        )}
      </main>

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        placements={placements}
        onConfirm={handleSaveToCalendar}
        saving={saving}
        taskColor={settings.taskColor}
        locale={locale}
      />

      <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('day.clearConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('day.clearConfirmDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearConfirmOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearPlacements();
                setClearConfirmOpen(false);
              }}
            >
              {t('common.clearAll')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer locale={locale} />
    </div>
  );
}

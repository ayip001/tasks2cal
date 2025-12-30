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
  filterTasks,
  invalidateUserCache,
} from '@/hooks/use-data';
import { useStarredTasks } from '@/hooks/use-starred-tasks';
import { useLocalPlacements } from '@/hooks/use-local-placements';
import { useWorkingHourFilters } from '@/hooks/use-working-hour-filters';
import { autoFitTasks } from '@/lib/autofit';
import { TaskPlacement, TaskFilter, GoogleTask } from '@/types';
import { TIME_SLOT_INTERVAL } from '@/lib/constants';
import { useTranslations } from '@/hooks/use-translations';
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
import { DayPageLoadingSkeleton } from '@/components/ui/loading-skeletons';

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

  const { tasks, taskLists, loading: tasksLoading, refetch: refetchTasks } = useTasks();
  const { settings, loading: settingsLoading, updateSettings, locale } = useSettings();
  const {
    isStarred,
    toggleStar,
    cleanupDeletedTasks,
    syncWithRedis,
  } = useStarredTasks(session?.user?.email ?? undefined);
  const { filters: workingHourFilters } = useWorkingHourFilters(session?.user?.email ?? undefined);
  const t = useTranslations(locale);
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
  } = useLocalPlacements(dateParam);
  const [autoFitLoading, setAutoFitLoading] = useState(false);

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

  // Enrich tasks with isStarred property
  const enrichedTasks = useMemo(() =>
    tasks.map((task) => ({
      ...task,
      isStarred: isStarred(task.id),
    })),
    [tasks, isStarred]
  );

  // Cleanup deleted tasks from starred list
  useEffect(() => {
    if (tasks.length > 0) {
      const taskIds = tasks.map((t) => t.id);
      cleanupDeletedTasks(taskIds);
    }
  }, [tasks, cleanupDeletedTasks]);

  // Compute filtered tasks from filter state
  const filteredTasks = useMemo(() => filterTasks(enrichedTasks, filter), [enrichedTasks, filter]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, router]);

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(dateParam) && DateTime.fromISO(dateParam).isValid;
  const viewedDayInSelectedZone = useMemo(
    () => DateTime.fromISO(dateParam, { zone: selectedTimeZone }),
    [dateParam, selectedTimeZone]
  );

  // Redirect to today if user attempts to access a date before today
  useEffect(() => {
    if (!isValidDate || status === 'loading' || settingsLoading) return;

    const effectiveSelectedTimeZone = normalizeIanaTimeZone(selectedTimeZone);
    const todayInSelectedZone = DateTime.now().setZone(effectiveSelectedTimeZone);
    const todayDateStr = todayInSelectedZone.toISODate();

    if (todayDateStr && dateParam < todayDateStr) {
      router.replace(`/day/${todayDateStr}`);
    }
  }, [dateParam, selectedTimeZone, isValidDate, status, settingsLoading, router]);

  if (status === 'unauthenticated') {
    return null;
  }

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
    return <DayPageLoadingSkeleton />;
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

  const handlePlacementDrop = (placementId: string, newStartTime: string) => {
    updatePlacement(placementId, { startTime: newStartTime });
  };

  const handleExternalDrop = (taskId: string, taskTitle: string, startTime: string, listId?: string, listTitle?: string) => {
    const newPlacement: TaskPlacement = {
      id: `${taskId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      taskId,
      taskTitle,
      listId,
      listTitle,
      startTime,
      duration: settings.defaultTaskDuration,
    };

    addPlacement(newPlacement);
    toast.success(t('day.addedToCalendar', { title: taskTitle }));
  };

  const handlePlacementClick = (placementId: string) => {
    removePlacement(placementId);
    toast.success(t('day.placementRemoved'));
  };

  const handleAutoFit = () => {
    if (filteredTasks.length === 0) {
      toast.error(t('day.noTasksToAutoFit'));
      return;
    }

    setAutoFitLoading(true);
    try {
      const result = autoFitTasks(
        filteredTasks,
        events,
        placements,
        settings,
        dateParam,
        selectedTimeZone,
        workingHourFilters
      );
      const allPlacements = [...placements, ...result.placements];
      setPlacements(allPlacements);
      toast.success(result.message);
    } catch {
      toast.error(t('day.failedAutoFit'));
    } finally {
      setAutoFitLoading(false);
    }
  };

  // Handle adding a single task via + button (mobile)
  const handleAddTask = (task: GoogleTask) => {
    try {
      // Try to auto-fit this single task
      const result = autoFitTasks(
        [task],
        events,
        placements,
        settings,
        dateParam,
        selectedTimeZone,
        workingHourFilters
      );

      if (result.placements.length > 0) {
        // Task was placed in working hours
        const allPlacements = [...placements, ...result.placements];
        setPlacements(allPlacements);
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
            listId: task.listId,
            listTitle: task.listTitle,
            startTime: foundSlot.toISOString(),
            duration: settings.defaultTaskDuration,
          };

          addPlacement(newPlacement);
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
          listColors: settings.listColors,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save events');
      }

      const result = await response.json();

      clearPlacements();
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

  const handleRefreshData = async () => {
    // Invalidate all caches for the current user
    if (session?.user?.email) {
      invalidateUserCache(session.user.email);
    }

    // Refetch all data and sync starred tasks with Redis
    await Promise.all([
      refetchTasks(),
      refetchCalendars(),
      refetchEvents(),
      syncWithRedis(),
    ]);
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
              taskLists={taskLists}
              onSave={updateSettings}
              onRefetchCalendars={refetchCalendars}
              onRefreshData={handleRefreshData}
              triggerVariant="ghost"
              triggerClassName="md:border md:border-input md:bg-background md:hover:bg-accent"
              locale={locale}
              userId={session?.user?.email ?? undefined}
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
            onToggleStar={toggleStar}
            locale={locale}
            taskColor={settings.taskColor}
            listColors={settings.listColors}
          />
        </div>
      </main>

      {/* Mobile: Tab content - same layout as desktop */}
      <main className="flex-1 md:hidden flex flex-col overflow-y-auto">
        {mobileView === 'calendar' ? (
          <div className="w-full p-4">
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
              onToggleStar={toggleStar}
              isMobile={true}
              locale={locale}
              taskColor={settings.taskColor}
              listColors={settings.listColors}
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
        listColors={settings.listColors}
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

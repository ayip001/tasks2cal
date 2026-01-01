'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { EventResizeDoneArg } from '@fullcalendar/interaction';
import luxonPlugin from '@fullcalendar/luxon3';
import type { EventDropArg, EventInput, EventContentArg, SlotLabelContentArg } from '@fullcalendar/core';
import { DateTime } from 'luxon';
import { GoogleCalendarEvent, TaskPlacement, UserSettings } from '@/types';
import { TIME_SLOT_INTERVAL } from '@/lib/constants';
import {
  formatTimeForDisplay,
  normalizeIanaTimeZone,
  parseTimeLabelToHHMM,
  utcISOStringFromInstant,
  wallTimeOnDateToUtc,
} from '@/lib/timezone';
import { logTimezoneDebug, onTimezoneDebugRefresh } from '@/lib/debug-timezone';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations, getFullCalendarLocale } from '@/hooks/use-translations';
import type { Locale } from '@/i18n/config';

interface DayCalendarProps {
  date: string;
  events: GoogleCalendarEvent[];
  placements: TaskPlacement[];
  onPlacementDrop: (placementId: string, newStartTime: string) => void;
  onPlacementResize: (placementId: string, newDuration: number) => void;
  onExternalDrop: (taskId: string, taskTitle: string, startTime: string, taskListId?: string, taskListTitle?: string) => void;
  onPlacementClick: (placementId: string) => void;
  onPastTimeDrop?: () => void;
  settings: UserSettings;
  selectedTimeZone: string;
  calendarTimeZone?: string;
  onNavigate: (direction: 'prev' | 'next') => void;
  locale?: Locale;
}

export function DayCalendar({
  date,
  events,
  placements,
  onPlacementDrop,
  onPlacementResize,
  onExternalDrop,
  onPlacementClick,
  onPastTimeDrop,
  settings,
  selectedTimeZone,
  calendarTimeZone,
  onNavigate,
  locale = 'en',
}: DayCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const t = useTranslations(locale);
  const fullCalendarLocale = getFullCalendarLocale(locale);
  const containerRef = useRef<HTMLDivElement>(null);

  const viewedDay = useMemo(
    () => DateTime.fromISO(date, { zone: selectedTimeZone }),
    [date, selectedTimeZone]
  );

  const isToday = useMemo(() => {
    const effectiveSelectedTimeZone = normalizeIanaTimeZone(selectedTimeZone);
    const nowInSelectedZone = DateTime.now().setZone(effectiveSelectedTimeZone);
    return nowInSelectedZone.toISODate() === date;
  }, [date, selectedTimeZone]);

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(date);
    }
  }, [date]);

  // Set calendar height based on screen size: auto on mobile, 100% on desktop
  useEffect(() => {
    if (!calendarRef.current) return;

    const calendarApi = calendarRef.current.getApi();
    const updateHeight = () => {
      const isMobile = window.innerWidth < 768; // md breakpoint
      calendarApi.setOption('height', isMobile ? 'auto' : '100%');
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Set CSS variable on document root (used for misc styling)
  useEffect(() => {
    document.documentElement.style.setProperty('--task-color', settings.taskColor);
    return () => {
      document.documentElement.style.removeProperty('--task-color');
    };
  }, [settings.taskColor]);

  // Determine if current time is outside visible range (for boundary indicator)
  const [nowIndicatorPosition, setNowIndicatorPosition] = useState<'top' | 'bottom' | null>(null);

  useEffect(() => {
    const effectiveSelectedTimeZone = normalizeIanaTimeZone(selectedTimeZone);

    const checkNowPosition = () => {
      const nowInSelectedZone = DateTime.now().setZone(effectiveSelectedTimeZone);

      // Only show boundary indicator if viewing today
      if (nowInSelectedZone.toISODate() !== date) {
        setNowIndicatorPosition(null);
        return;
      }

      const [minHour, minMin] = settings.slotMinTime.split(':').map(Number);
      const [maxHour, maxMin] = settings.slotMaxTime.split(':').map(Number);
      const currentMinutes = nowInSelectedZone.hour * 60 + nowInSelectedZone.minute;
      const minMinutes = minHour * 60 + minMin;
      const maxMinutes = maxHour * 60 + maxMin;

      if (currentMinutes < minMinutes) {
        setNowIndicatorPosition('top');
      } else if (currentMinutes >= maxMinutes) {
        setNowIndicatorPosition('bottom');
      } else {
        setNowIndicatorPosition(null);
      }
    };

    checkNowPosition();
    const interval = setInterval(checkNowPosition, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [date, selectedTimeZone, settings.slotMinTime, settings.slotMaxTime]);

  useEffect(() => {
    if (!containerRef.current) return;
    logTimezoneDebug({
      container: containerRef.current,
      dateISO: date,
      selectedTimeZone,
      calendarTimeZone,
      slotMinTime: settings.slotMinTime,
      slotMaxTime: settings.slotMaxTime,
      timeFormat: settings.timeFormat,
    });
  }, [date, selectedTimeZone, calendarTimeZone, settings.slotMinTime, settings.slotMaxTime, settings.timeFormat]);

  useEffect(() => {
    return onTimezoneDebugRefresh(() => {
      if (!containerRef.current) return;
      logTimezoneDebug({
        container: containerRef.current,
        dateISO: date,
        selectedTimeZone,
        calendarTimeZone,
        slotMinTime: settings.slotMinTime,
        slotMaxTime: settings.slotMaxTime,
        timeFormat: settings.timeFormat,
      });
    });
  }, [date, selectedTimeZone, calendarTimeZone, settings.slotMinTime, settings.slotMaxTime, settings.timeFormat]);

  // Inject boundary indicator into FullCalendar's scroll container
  useEffect(() => {
    if (!containerRef.current || !nowIndicatorPosition) return;

    // Find the time grid body inside FullCalendar
    const timeGridBody = containerRef.current.querySelector('.fc-timegrid-body');
    if (!timeGridBody) return;

    // Create the indicator element
    const indicator = document.createElement('div');
    indicator.className = 'fc-boundary-now-indicator';
    indicator.style.cssText = `
      position: absolute;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      pointer-events: none;
      z-index: 10;
      ${nowIndicatorPosition === 'top' ? 'top: 0;' : 'bottom: 0;'}
    `;
    indicator.innerHTML = `
      <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #ea4335; margin-left: -6px;"></div>
      <div style="flex: 1; height: 3px; background-color: #ea4335;"></div>
    `;

    // Ensure timeGridBody has relative positioning
    (timeGridBody as HTMLElement).style.position = 'relative';
    timeGridBody.appendChild(indicator);

    return () => {
      indicator.remove();
    };
  }, [nowIndicatorPosition]);

  // Inject working hour labels after calendar renders
  useEffect(() => {
    if (!containerRef.current || !calendarRef.current) return;

    // Wait for FullCalendar to finish rendering
    const timer = setTimeout(() => {
      const timeGridBody = containerRef.current?.querySelector('.fc-timegrid-body');
      if (!timeGridBody) return;

      // Remove any existing labels
      const existingLabels = timeGridBody.querySelectorAll('.working-hour-labels');
      existingLabels.forEach(label => label.remove());

      // Create labels container for each end time group
      Object.entries(workingHoursByEndTime).forEach(([endTimeISO, periods]) => {
        // Find all background events (working hour outlines)
        const bgEvents = timeGridBody.querySelectorAll('.fc-bg-event.working-hour-outline');

        // Find the event that matches this end time
        let matchingEvent: Element | null = null;
        bgEvents.forEach((el) => {
          const fcEvent = (el as any).fcSeg?.eventRange?.def;
          if (fcEvent && fcEvent.publicId === `working-hour-${periods[0].id}`) {
            matchingEvent = el;
          }
        });

        if (!matchingEvent) return;

        // Create labels container
        const labelsContainer = document.createElement('div');
        labelsContainer.className = 'working-hour-labels';
        labelsContainer.style.cssText = `
          position: absolute;
          right: 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          align-items: flex-end;
          pointer-events: none;
          z-index: 5;
        `;

        // Position at the bottom of the event
        const rect = matchingEvent.getBoundingClientRect();
        const parentRect = timeGridBody.getBoundingClientRect();
        const bottom = rect.bottom - parentRect.top;
        labelsContainer.style.top = `${bottom + 2}px`;

        // Add label for each period ending at this time (in settings order)
        periods.forEach((period) => {
          const labelBgColor = mixColorWithWhite(period.color, 0.5);
          const label = document.createElement('div');
          label.className = 'text-xs px-2 py-1 rounded whitespace-nowrap';
          label.style.cssText = `
            background-color: ${labelBgColor};
            color: #374151;
            font-size: 0.75rem;
            font-weight: 500;
            opacity: 1;
          `;
          label.textContent = period.name;
          labelsContainer.appendChild(label);
        });

        timeGridBody.appendChild(labelsContainer);
      });
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      const timeGridBody = containerRef.current?.querySelector('.fc-timegrid-body');
      if (timeGridBody) {
        const labels = timeGridBody.querySelectorAll('.working-hour-labels');
        labels.forEach(label => label.remove());
      }
    };
  }, [workingHoursByEndTime, date, settings.workingHours]);

  // Get the color for a placement based on priority: list color > working hour color > default task color
  const getPlacementColor = (listId?: string, workingHourColor?: string) => {
    if (listId && settings.listColors?.[listId]) {
      return settings.listColors[listId];
    }
    if (workingHourColor) {
      return workingHourColor;
    }
    return settings.taskColor;
  };

  // Helper function to mix color with white (50/50 mix for labels)
  const mixColorWithWhite = (hexColor: string, intensity: number = 0.5): string => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const mixedR = Math.round(255 * (1 - intensity) + r * intensity);
    const mixedG = Math.round(255 * (1 - intensity) + g * intensity);
    const mixedB = Math.round(255 * (1 - intensity) + b * intensity);
    return `#${mixedR.toString(16).padStart(2, '0')}${mixedG.toString(16).padStart(2, '0')}${mixedB.toString(16).padStart(2, '0')}`;
  };

  // Group working hours by end time for label stacking
  const workingHoursByEndTime = useMemo(() => {
    const groups: Record<string, Array<{ id: string; name: string; color: string; endTime: Date }>> = {};

    settings.workingHours.forEach((wh, index) => {
      const endTime = wallTimeOnDateToUtc(date, wh.end, normalizeIanaTimeZone(selectedTimeZone));
      const key = endTime.toISOString();

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push({
        id: wh.id,
        name: wh.name || `Period ${index + 1}`,
        color: wh.color || '#9ca3af',
        endTime: endTime,
      });
    });

    return groups;
  }, [settings.workingHours, date, selectedTimeZone]);

  const calendarEvents: EventInput[] = [
    // Working hours as background events (reversed so last one renders on top)
    ...settings.workingHours.slice().reverse().map((wh, index) => {
      const originalIndex = settings.workingHours.length - 1 - index;
      const startTime = wallTimeOnDateToUtc(date, wh.start, normalizeIanaTimeZone(selectedTimeZone));
      const endTime = wallTimeOnDateToUtc(date, wh.end, normalizeIanaTimeZone(selectedTimeZone));
      const color = wh.color || '#9ca3af';

      return {
        id: `working-hour-${wh.id}`,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        display: 'background',
        backgroundColor: 'transparent',
        borderColor: color,
        classNames: ['working-hour-outline'],
        extendedProps: {
          type: 'working-hour',
          workingHourIndex: originalIndex,
          workingHourName: wh.name || `Period ${originalIndex + 1}`,
          workingHourColor: color,
          endTimeISO: endTime.toISOString(),
        },
      };
    }),
    ...events.map((event) => ({
      id: `event-${event.id}`,
      title: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      backgroundColor: '#9ca3af',
      borderColor: '#9ca3af',
      editable: false,
      extendedProps: {
        type: 'google-event',
      },
    })),
    ...placements.map((placement) => {
      const color = getPlacementColor(placement.listId, placement.workingHourColor);
      return {
        id: `placement-${placement.id}`,
        title: placement.taskTitle,
        start: placement.startTime,
        end: new Date(Date.parse(placement.startTime) + placement.duration * 60 * 1000).toISOString(),
        backgroundColor: color,
        borderColor: color,
        editable: true,
        classNames: ['temp-placement'],
        extendedProps: {
          type: 'placement',
          placementId: placement.id,
          listTitle: placement.listTitle,
        },
      };
    }),
  ];

  const renderEventContent = (eventInfo: EventContentArg) => {
    const eventType = eventInfo.event.extendedProps?.type;
    const isPlacement = eventType === 'placement';
    const isWorkingHour = eventType === 'working-hour';
    const listTitle = eventInfo.event.extendedProps?.listTitle;
    const placementId = eventInfo.event.extendedProps?.placementId;

    // Working hours don't render any content (labels handled separately)
    if (isWorkingHour) {
      return null;
    }

    if (isPlacement) {
      return (
        <div className="flex flex-col h-full w-full overflow-hidden p-1">
          <div className="flex items-start justify-between gap-1">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-xs truncate">{eventInfo.event.title}</div>
              {listTitle && (
                <div className="text-[10px] opacity-75 truncate">{listTitle}</div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (placementId) {
                  onPlacementClick(placementId);
                }
              }}
              className="flex-shrink-0 p-0.5 rounded hover:bg-black/20 transition-colors"
              title={t('tasks.removePlacement')}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      );
    }

    // Default rendering for Google Calendar events
    return (
      <div className="p-1 overflow-hidden">
        <div className="font-medium text-xs truncate">{eventInfo.event.title}</div>
      </div>
    );
  };

  // Check if a time is in the past
  const isTimeInPast = (time: Date): boolean => {
    return time < new Date();
  };

  const handleEventDrop = (info: EventDropArg) => {
    const placementId = info.event.extendedProps?.placementId;
    if (placementId && info.event.start) {
      // Prevent dropping placements on past times
      if (isTimeInPast(info.event.start)) {
        info.revert();
        onPastTimeDrop?.();
        return;
      }
      onPlacementDrop(placementId, utcISOStringFromInstant(info.event.start));
    }
  };

  const handleEventResize = (info: EventResizeDoneArg) => {
    const placementId = info.event.extendedProps?.placementId;
    if (placementId && info.event.start && info.event.end) {
      // Calculate new duration in minutes
      const durationMs = info.event.end.getTime() - info.event.start.getTime();
      const durationMinutes = Math.round(durationMs / (60 * 1000));
      onPlacementResize(placementId, durationMinutes);
    }
  };

  // Handle external drops from task panel - this fires after FullCalendar validates the drop
  const handleEventReceive = (info: { event: { start: Date | null; remove: () => void }; draggedEl: HTMLElement }) => {
    const taskId = info.draggedEl.dataset.taskId;
    const taskTitle = info.draggedEl.dataset.taskTitle;
    const taskListId = info.draggedEl.dataset.taskListId;
    const taskListTitle = info.draggedEl.dataset.taskListTitle;

    if (taskId && taskTitle && info.event.start) {
      // Prevent dropping on past times
      if (isTimeInPast(info.event.start)) {
        info.event.remove();
        onPastTimeDrop?.();
        return;
      }
      // Remove the temporary event that FullCalendar created
      info.event.remove();
      // Create our own placement through the callback
      onExternalDrop(taskId, taskTitle, utcISOStringFromInstant(info.event.start), taskListId, taskListTitle);
    }
  };

  // Convert working hours to FullCalendar businessHours format
  const businessHours = settings.workingHours.map((hours) => ({
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // All days
    startTime: hours.start,
    endTime: hours.end,
  }));

  // Use fallback values if settings are missing (e.g., from old saved settings)
  const slotMinTime = settings.slotMinTime || '06:00';
  const slotMaxTime = settings.slotMaxTime || '22:00';

  const renderSlotLabelContent = (arg: SlotLabelContentArg) => {
    const effectiveSelectedTimeZone = normalizeIanaTimeZone(selectedTimeZone);
    const hhmm = parseTimeLabelToHHMM(arg.text, settings.timeFormat);
    if (!hhmm) {
      // Fallback to FullCalendar-provided text if parsing ever fails.
      return <span>{arg.text}</span>;
    }

    const slotUtc = wallTimeOnDateToUtc(date, hhmm, effectiveSelectedTimeZone);
    const primary = DateTime.fromJSDate(slotUtc).setZone(effectiveSelectedTimeZone);
    const primaryLabel = formatTimeForDisplay(primary, settings.timeFormat, locale);

    const effectiveCalendarTimeZone = normalizeIanaTimeZone(calendarTimeZone);
    const secondary = DateTime.fromJSDate(slotUtc).setZone(effectiveCalendarTimeZone);

    const hasSecondary =
      Boolean(calendarTimeZone) &&
      effectiveCalendarTimeZone !== effectiveSelectedTimeZone &&
      primary.offset !== secondary.offset;

    if (!hasSecondary) {
      return <span>{primaryLabel}</span>;
    }

    const secondaryLabel = formatTimeForDisplay(secondary, settings.timeFormat, locale);

    const primaryDate = primary.toISODate();
    const secondaryDate = secondary.toISODate();
    const dayIndicator =
      !primaryDate || !secondaryDate || primaryDate === secondaryDate
        ? ''
        : secondaryDate < primaryDate
          ? ' -1'
          : ' +1';

    return (
      <div className="flex flex-col leading-tight">
        <span>{primaryLabel}</span>
        <span className="text-[10px] text-muted-foreground">
          {secondaryLabel}
          {dayIndicator}
        </span>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="h-auto md:h-full flex flex-col day-calendar-container"
      style={{ '--task-color': settings.taskColor } as React.CSSProperties}
    >
      <div className="flex items-center justify-center gap-1 md:gap-2 mb-2 md:mb-4">
        <Button variant="ghost" size="icon" onClick={() => onNavigate('prev')} disabled={isToday}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-sm md:text-lg font-semibold min-w-[120px] md:min-w-[240px] text-center">
          <span className="md:hidden">
            {locale === 'zh-hk'
              ? viewedDay.setLocale(fullCalendarLocale).toFormat('M月d日')
              : viewedDay.setLocale(fullCalendarLocale).toFormat('MMM d')}
          </span>
          <span className="hidden md:inline">
            {locale === 'zh-hk'
              ? viewedDay.setLocale(fullCalendarLocale).toFormat("yyyy'年'M'月'd'日（'EEEE'）'")
              : viewedDay.setLocale(fullCalendarLocale).toFormat('EEEE, MMMM d, yyyy')}
          </span>
        </h2>
        <Button variant="ghost" size="icon" onClick={() => onNavigate('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-full md:flex-1 md:min-h-0">
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin, luxonPlugin]}
          initialView="timeGridDay"
          initialDate={date}
          headerToolbar={false}
          allDaySlot={false}
          locale={fullCalendarLocale}
          timeZone={normalizeIanaTimeZone(selectedTimeZone)}
          slotDuration={`00:${TIME_SLOT_INTERVAL}:00`}
          slotMinTime={`${slotMinTime}:00`}
          slotMaxTime={`${slotMaxTime}:00`}
          height="auto"
          events={calendarEvents}
          editable={true}
          selectable={false}
          droppable={true}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventContent={renderEventContent}
          eventReceive={handleEventReceive}
          eventOverlap={false}
          slotEventOverlap={false}
          snapDuration={`00:${TIME_SLOT_INTERVAL}:00`}
          nowIndicator={true}
          businessHours={businessHours}
          slotLaneClassNames="fc-slot-lane"
          slotLabelContent={renderSlotLabelContent}
        />
      </div>
    </div>
  );
}

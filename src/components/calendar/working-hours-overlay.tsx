'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { WorkingHours } from '@/types';

interface WorkingHoursOverlayProps {
  workingHours: WorkingHours[];
  slotMinTime: string;
  slotMaxTime: string;
  date: string;
  timeZone: string;
  onResize?: (id: string, newStart: string, newEnd: string) => void;
}

// Convert HH:MM to minutes since midnight
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convert minutes since midnight to HH:MM
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Mix color with white at specified intensity (no opacity blending)
function mixColorWithWhite(hexColor: string, intensity: number = 0.25): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Parse hex color
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Mix with white (255, 255, 255)
  const mixedR = Math.round(255 * (1 - intensity) + r * intensity);
  const mixedG = Math.round(255 * (1 - intensity) + g * intensity);
  const mixedB = Math.round(255 * (1 - intensity) + b * intensity);

  return `rgb(${mixedR}, ${mixedG}, ${mixedB})`;
}

export function WorkingHoursOverlay({
  workingHours,
  slotMinTime,
  slotMaxTime,
  date,
  timeZone,
  onResize,
}: WorkingHoursOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState<{ id: string; edge: 'top' | 'bottom' } | null>(null);
  const [calendarBounds, setCalendarBounds] = useState<DOMRect | null>(null);

  // Get the FullCalendar time grid element to calculate positions
  useEffect(() => {
    // Find the FullCalendar time grid container
    const updateBounds = () => {
      const fcTimeGrid = document.querySelector('.fc-timegrid-body');
      if (fcTimeGrid) {
        setCalendarBounds(fcTimeGrid.getBoundingClientRect());
      }
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);

    // Also update on scroll (in case of position changes)
    const handleScroll = () => updateBounds();
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', updateBounds);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [workingHours]);

  const calendarMinMinutes = timeToMinutes(slotMinTime);
  const calendarMaxMinutes = timeToMinutes(slotMaxTime);
  const calendarDurationMinutes = calendarMaxMinutes - calendarMinMinutes;

  // Calculate position and height for each working hour period
  const overlayData = useMemo(() => {
    if (!calendarBounds) return [];

    return workingHours.map((wh, index) => {
      const startMinutes = timeToMinutes(wh.start);
      const endMinutes = timeToMinutes(wh.end);

      // Calculate top position as percentage from calendar start
      const offsetFromTopMinutes = startMinutes - calendarMinMinutes;
      const topPercent = (offsetFromTopMinutes / calendarDurationMinutes) * 100;

      // Calculate height as percentage
      const durationMinutes = endMinutes - startMinutes;
      const heightPercent = (durationMinutes / calendarDurationMinutes) * 100;

      const color = wh.color || '#9ca3af';
      const labelBgColor = mixColorWithWhite(color, 0.25);

      // Z-index: last working hour in array should be on top
      const zIndex = workingHours.length - index;

      return {
        id: wh.id,
        name: wh.name || `Period ${index + 1}`,
        topPercent,
        heightPercent,
        color,
        labelBgColor,
        zIndex,
      };
    });
  }, [workingHours, calendarMinMinutes, calendarDurationMinutes, calendarBounds]);

  // Group overlays by end time for label stacking
  const labelGroups = useMemo(() => {
    const groups: Record<number, typeof overlayData> = {};

    overlayData.forEach((overlay) => {
      const endPosition = overlay.topPercent + overlay.heightPercent;
      if (!groups[endPosition]) {
        groups[endPosition] = [];
      }
      groups[endPosition].push(overlay);
    });

    return groups;
  }, [overlayData]);

  if (!calendarBounds || overlayData.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
      }}
    >
      {/* Render outlines */}
      {overlayData.map((overlay) => (
        <div
          key={`outline-${overlay.id}`}
          className="absolute pointer-events-none"
          style={{
            top: `${overlay.topPercent}%`,
            left: '0',
            right: '0',
            height: `${overlay.heightPercent}%`,
            border: `2px solid ${overlay.color}`,
            borderRadius: '16px',
            zIndex: overlay.zIndex,
          }}
        />
      ))}

      {/* Render labels (always visible, stacked by end position) */}
      {Object.entries(labelGroups).map(([endPosition, groupOverlays]) => {
        const endPercent = parseFloat(endPosition);

        return (
          <div
            key={`label-group-${endPosition}`}
            className="absolute pointer-events-auto"
            style={{
              top: `${endPercent}%`,
              right: '0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '2px',
            }}
          >
            {groupOverlays.map((overlay) => (
              <div
                key={`label-${overlay.id}`}
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: overlay.labelBgColor,
                  color: '#374151',
                  whiteSpace: 'nowrap',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                {overlay.name}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

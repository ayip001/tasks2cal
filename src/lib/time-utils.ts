/**
 * Shared time utility functions
 *
 * These utilities are used across multiple components for time manipulation
 * and formatting in the settings panels.
 */

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Format time based on 12h/24h preference
 */
export function formatTime(time: string, format: '12h' | '24h'): string {
  const [hours, minutes] = time.split(':').map(Number);
  if (format === '24h') {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Generate time options at specified minute intervals for dropdowns
 */
export function generateTimeOptions(
  intervalMinutes: number,
  format: '12h' | '24h'
): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  const totalSlots = (24 * 60) / intervalMinutes;

  for (let i = 0; i < totalSlots; i++) {
    const totalMinutes = i * intervalMinutes;
    const value = minutesToTime(totalMinutes);
    options.push({ value, label: formatTime(value, format) });
  }

  return options;
}

/**
 * Generate hour options (00:00 to 23:00) for dropdowns
 */
export function generateHourOptions(
  format: '12h' | '24h'
): Array<{ value: string; label: string }> {
  return Array.from({ length: 24 }, (_, i) => {
    const value = `${i.toString().padStart(2, '0')}:00`;
    return { value, label: formatTime(value, format) };
  });
}

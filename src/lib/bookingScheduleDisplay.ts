/**
 * Booking schedule display for admin (and similar) UIs.
 *
 * The API stores `scheduledDate` as a UTC instant at 00:00:00Z for the session
 * calendar day; wall-clock time lives in `scheduledTime` as UTC HH:mm.
 * Formatting `scheduledDate` with local timezone shows 02:00 in SAST — wrong.
 *
 * `scheduledTime` must be shifted by +2 hours to match South African Standard
 * Time (SAST), aligned with backend `convertUTCToSAST` in date-helpers.ts.
 */

export function formatUtcCalendarDate(iso?: string | null): string {
  if (!iso) return '--';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--';
  return d.toLocaleDateString('en-ZA', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Converts UTC HH:mm (as stored on Booking.scheduledTime) to SAST for display. */
export function utcTimeStringToSast(time: string): string {
  const trimmed = time.trim();
  const m = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!m) return trimmed;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return trimmed;
  const sastHours = (hours + 2) % 24;
  return `${String(sastHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** One line: calendar date (UTC day) + local session time in SAST when time is present. */
export function formatBookingScheduledDisplay(
  scheduledDateIso?: string | null,
  scheduledTimeUtc?: string | null,
): string {
  const datePart = formatUtcCalendarDate(scheduledDateIso);
  const t = scheduledTimeUtc?.trim();
  if (!t) return datePart;
  return `${datePart} at ${utcTimeStringToSast(t)}`;
}

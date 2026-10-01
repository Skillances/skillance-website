/** Date and time display for API strings (`scheduledDate` YYYY-MM-DD or ISO, `scheduledTime` HH:mm SAST). */

const SA_TZ = 'Africa/Johannesburg';

/** `YYYY-MM-DD` from a date-only string or an ISO timestamp. */
export function dateOnly(value: string | null | undefined): string {
  return String(value ?? '').slice(0, 10);
}

/** Today's date and minutes past midnight in South Africa. */
export function sastNow(): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** True when the slot on [date] at [hhmm] (SAST) has already started. */
export function isPastSlot(date: string, hhmm: string): boolean {
  const now = sastNow();
  if (date < now.date) return true;
  if (date > now.date) return false;
  return timeToMinutes(hhmm) <= now.minutes;
}

/** "Sat, 3 Oct 2026". Parses YYYY-MM-DD as a calendar date (no timezone shift). */
export function formatDate(value: string | null | undefined, opts?: { weekday?: boolean; year?: boolean }): string {
  const d = dateOnly(value);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return value ?? '';
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'UTC',
    weekday: opts?.weekday === false ? undefined : 'short',
    day: 'numeric',
    month: 'short',
    year: opts?.year === false ? undefined : 'numeric',
  }).format(date);
}

/** Timestamp (ISO) in South African time, e.g. "3 Oct 2026, 14:05". */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('en-ZA', {
    timeZone: SA_TZ,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(d);
}

/** "14:05" from an ISO timestamp, in South African time. */
export function formatClock(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-ZA', { timeZone: SA_TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
}

/** "1h 30m", "45m", "2h". */
export function formatDuration(minutes: number | null | undefined): string {
  const m = Math.max(0, Math.round(Number(minutes) || 0));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h && r) return `${h}h ${r}m`;
  if (h) return `${h}h`;
  return `${r}m`;
}

/** HH:mm plus minutes, e.g. ("09:00", 90) -> "10:30". */
export function addMinutes(hhmm: string, minutes: number): string {
  const total = (timeToMinutes(hhmm) + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Calendar helpers on YYYY-MM-DD strings. */
export function ymd(year: number, month0: number, day: number): string {
  return `${year}-${String(month0 + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function monthBounds(year: number, month0: number): { start: string; end: string; days: number; firstWeekday: number } {
  const days = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, month0, 1)).getUTCDay();
  return { start: ymd(year, month0, 1), end: ymd(year, month0, days), days, firstWeekday };
}

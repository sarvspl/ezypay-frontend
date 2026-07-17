/**
 * Date-range filtering helpers, shared by the dashboard pages that filter by day.
 *
 * The dashboard renders every timestamp in one fixed timezone, so the filters
 * work in that timezone's calendar days too. Deriving "today" from the browser
 * clock instead would resolve to the wrong day for anyone travelling or for a
 * merchant working either side of midnight.
 */

export const TZ = 'Asia/Dhaka';
export const TZ_LABEL = 'Bangladesh time';

// en-CA renders as YYYY-MM-DD — the same shape <input type="date"> expects.
export const todayInTz = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });

// Calendar arithmetic on a date-only value. Anchored to UTC so it can't be
// skewed by a DST jump in the host's own timezone.
export const shiftDays = (ymd, n) => {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// Presets resolve to an explicit {from,to} at click time; '' means unbounded.
export const RANGES = [
  { key: 'all',   label: 'All time', resolve: () => ({ from: '', to: '' }) },
  { key: 'today', label: 'Today',    resolve: () => ({ from: todayInTz(), to: todayInTz() }) },
  { key: '7d',    label: '7 days',   resolve: () => ({ from: shiftDays(todayInTz(), -6),  to: todayInTz() }) },
  { key: '30d',   label: '30 days',  resolve: () => ({ from: shiftDays(todayInTz(), -29), to: todayInTz() }) },
];

export const resolveRange = (key) => (RANGES.find((r) => r.key === key) || RANGES[0]).resolve();

// 'YYYY-MM-DD' -> '17 Jul 2026'. Parsed as UTC so the label can't drift a day.
export const formatDay = (ymd) =>
  new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-GB', {
    timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric',
  });

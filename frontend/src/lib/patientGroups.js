// Shared rules for grouping patients so every admin screen agrees on who is a
// "regular / package" patient versus a "new / one-off" patient. Keeping this in
// one place is what stops the lists from becoming a mixture.

const ACTIVE = new Set(['booked', 'confirmed', 'checked_in']);
const LINED_UP = new Set(['confirmed', 'checked_in']);

/**
 * Build a map of patientId -> session stats from the appointments array.
 *   total    – every session the patient has ever had
 *   upcoming – future sessions that are still active (not cancelled/done)
 *   linedUp  – future sessions that are confirmed or checked-in (a real plan)
 *   next     – the soonest upcoming appointment object (or null)
 */
export const buildPatientStats = (appointments = []) => {
  const now = Date.now();
  const map = new Map();
  for (const a of appointments) {
    const s = map.get(a.patient_id) || { total: 0, upcoming: 0, linedUp: 0, next: null };
    s.total += 1;
    const t = new Date(a.scheduled_at).getTime();
    if (t >= now && ACTIVE.has(a.status)) {
      s.upcoming += 1;
      if (LINED_UP.has(a.status)) s.linedUp += 1;
      if (!s.next || t < new Date(s.next.scheduled_at).getTime()) s.next = a;
    }
    map.set(a.patient_id, s);
  }
  return map;
};

/**
 * A regular / package patient has an ongoing course of care: more than one
 * session in total, or at least one confirmed session already lined up.
 * Everyone else is treated as new / one-off.
 */
export const isRegular = (stats) => !!stats && (stats.total >= 2 || stats.linedUp >= 1);

export const patientGroup = (stats) => (isRegular(stats) ? 'regular' : 'new');

/** Short, human date+time for a lined-up session (e.g. "6 Sep, 10:00 am"). */
export const formatNext = (iso) =>
  new Date(iso).toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

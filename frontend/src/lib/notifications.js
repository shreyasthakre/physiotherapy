// Shared helpers for rendering the notification log across the admin UI.

export const channelTone = {
  whatsapp: 'bg-teal-50 text-teal-700',
  sms: 'bg-brand-50 text-brand-700',
  email: 'bg-amber-50 text-amber-700',
  call: 'bg-violet-50 text-violet-700',
};

export const channelLabel = { whatsapp: 'WhatsApp', sms: 'SMS', email: 'Email', call: 'Call' };

export const eventLabel = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  rescheduled: 'Rescheduled',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show: 'Missed',
  reminder: 'Reminder',
  custom: 'Update',
};

/**
 * Collapse the per-channel rows of a single action (same appointment, event,
 * message and ~5s window) into one entry, aggregating the channels.
 */
export const groupNotifications = (list) => {
  const map = new Map();
  const groups = [];
  for (const n of list || []) {
    const bucket = Math.floor(new Date(n.created_at).getTime() / 5000);
    const key = `${n.appointment_id}|${n.event}|${n.message}|${bucket}`;
    let g = map.get(key);
    if (!g) {
      g = {
        id: key,
        patientName: n.patient_name,
        event: n.event,
        message: n.message,
        createdAt: n.created_at,
        channels: [],
      };
      map.set(key, g);
      groups.push(g);
    }
    if (!g.channels.includes(n.channel)) g.channels.push(n.channel);
  }
  return groups;
};

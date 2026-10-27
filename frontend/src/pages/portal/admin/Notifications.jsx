import { useState } from 'react';
import Spinner from '../../../components/Spinner.jsx';
import { IconBell } from '../../../components/icons.jsx';
import { useAdminData } from '../../../context/AdminDataContext.jsx';
import { groupNotifications, channelTone, channelLabel, eventLabel } from '../../../lib/notifications.js';

const formatTime = (iso) =>
  new Date(iso).toLocaleString('en-AU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const CHANNELS = ['all', 'whatsapp', 'sms', 'email', 'call'];
const EVENTS = ['all', 'scheduled', 'confirmed', 'rescheduled', 'cancelled', 'completed', 'no_show', 'reminder', 'custom'];

const Notifications = () => {
  const { notifications, notificationsLoading, refreshAppointments } = useAdminData();

  const [query, setQuery] = useState('');
  const [channel, setChannel] = useState('all');
  const [event, setEvent] = useState('all');

  const q = query.trim().toLowerCase();
  const filtered = notifications.filter((n) => {
    if (channel !== 'all' && n.channel !== channel) return false;
    if (event !== 'all' && n.event !== event) return false;
    if (q) {
      const hay = `${n.patient_name || ''} ${n.message || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const groups = groupNotifications(filtered);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <IconBell className="h-5 w-5 text-brand-600" /> Sent messages
        </h1>
        <button
          type="button"
          className="btn-ghost"
          onClick={refreshAppointments}
        >
          Refresh
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Appointment updates sent to patients. Use this only when you need to confirm delivery history.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          className="input max-w-xs"
          placeholder="Search patient or message…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="input w-auto" value={channel} onChange={(e) => setChannel(e.target.value)}>
          {CHANNELS.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? 'All channels' : channelLabel[c]}
            </option>
          ))}
        </select>
        <select className="input w-auto" value={event} onChange={(e) => setEvent(e.target.value)}>
          {EVENTS.map((e) => (
            <option key={e} value={e}>
              {e === 'all' ? 'All events' : eventLabel[e]}
            </option>
          ))}
        </select>
        <span className="ml-auto text-sm text-slate-400">{groups.length} entr{groups.length === 1 ? 'y' : 'ies'}</span>
      </div>

      <div className="mt-4 space-y-2">
        {notificationsLoading ? (
          <Spinner />
        ) : groups.length > 0 ? (
          groups.map((g) => (
            <div key={g.id} className="card flex items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="text-sm">
                  <span className="font-semibold text-slate-800">{g.patientName || 'Patient'}</span>
                  <span className="text-slate-400"> · {eventLabel[g.event] || 'Update'}</span>
                </p>
                <p className="mt-1 text-sm text-slate-600">{g.message}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {g.channels.map((c) => (
                    <span key={c} className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${channelTone[c] || 'bg-slate-100 text-slate-500'}`}>
                      {channelLabel[c] || c}
                    </span>
                  ))}
                </div>
              </div>
              <span className="shrink-0 text-xs text-slate-400">{formatTime(g.createdAt)}</span>
            </div>
          ))
        ) : (
          <div className="card p-8 text-center text-slate-500">No notifications match your filters.</div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

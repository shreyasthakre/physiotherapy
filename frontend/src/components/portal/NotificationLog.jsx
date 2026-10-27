import { useState } from 'react';
import Spinner from '../Spinner.jsx';
import { IconBell } from '../icons.jsx';
import { groupNotifications, channelTone, channelLabel, eventLabel } from '../../lib/notifications.js';

const formatTime = (iso) =>
  new Date(iso).toLocaleString('en-AU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const DEFAULT_VISIBLE = 5;

const NotificationLog = ({ notifications, loading, title = 'Notifications sent' }) => {
  const [expanded, setExpanded] = useState(false);
  const groups = groupNotifications(notifications);
  const visible = expanded ? groups : groups.slice(0, DEFAULT_VISIBLE);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <IconBell className="h-5 w-5 text-brand-600" /> {title}
        </h2>
        {groups.length > 0 && <span className="text-xs font-medium text-slate-400">{groups.length} total</span>}
      </div>

      <div className={`mt-4 space-y-2 ${expanded ? 'max-h-96 overflow-y-auto pr-1' : ''}`}>
        {loading ? (
          <Spinner />
        ) : groups.length > 0 ? (
          visible.map((g) => (
            <div key={g.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm">
                  <span className="font-semibold text-slate-800">{g.patientName || 'Patient'}</span>
                  <span className="text-slate-400"> · {eventLabel[g.event] || 'Update'}</span>
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
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
          <p className="text-sm text-slate-500">No notifications sent yet.</p>
        )}
      </div>

      {groups.length > DEFAULT_VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-sm font-semibold text-brand-700 hover:underline"
        >
          {expanded ? 'Show less' : `Show all ${groups.length}`}
        </button>
      )}
    </div>
  );
};

export default NotificationLog;

import { useState } from 'react';
import StatusBadge from '../StatusBadge.jsx';
import { IconChat, IconClock } from '../icons.jsx';
import api from '../../lib/api.js';

const pad = (n) => String(n).padStart(2, '0');

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' });

const localDate = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const localTime = (iso) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const channelSummary = (notified) => {
  if (!notified?.sent?.length) return null;
  const names = { whatsapp: 'WhatsApp', sms: 'SMS', email: 'email', call: 'call' };
  const unique = [...new Set(notified.sent.map((s) => names[s.channel] || s.channel))];
  return unique.join(' + ');
};

const ActionButton = ({ tone = 'slate', onClick, disabled, children }) => {
  const tones = {
    brand: 'text-brand-700 hover:bg-brand-50',
    teal: 'text-teal-700 hover:bg-teal-50',
    rose: 'text-rose-600 hover:bg-rose-50',
    slate: 'text-slate-600 hover:bg-slate-100',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition disabled:opacity-40 ${tones[tone]}`}
    >
      {children}
    </button>
  );
};

const PrimaryButton = ({ onClick, disabled, children }) => (
  <button type="button" onClick={onClick} disabled={disabled} className="btn-primary py-1.5 text-xs">
    {children}
  </button>
);

/**
 * A single appointment with staff controls: assign a physio, confirm,
 * complete, mark missed (no-show), reschedule, cancel, and send a
 * WhatsApp / SMS / email / call update to the patient.
 */
const AppointmentCard = ({ appointment: a, physios, canAssign = false, variant = 'admin', onChanged, onToast, onOpenNotes }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showNotify, setShowNotify] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [channel, setChannel] = useState('whatsapp');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState(localDate(a.scheduled_at));
  const [time, setTime] = useState(localTime(a.scheduled_at));

  const isClosed = a.status === 'completed' || a.status === 'cancelled' || a.status === 'no_show';

  const patch = async (body, verb) => {
    setBusy(true);
    setError('');
    try {
      const res = await api.patch(`/appointments/${a.id}`, body);
      const summary = channelSummary(res.data.notified);
      onToast?.(
        summary
          ? `${verb} — ${summary} update sent to ${a.patient_name}.`
          : `${verb}.`,
      );
      setShowReschedule(false);
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const assign = async (physiotherapistId) => {
    setBusy(true);
    setError('');
    try {
      await api.patch(`/appointments/${a.id}`, { physiotherapistId });
      onToast?.('Physiotherapist assigned.');
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const sendNotify = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await api.post(`/appointments/${a.id}/notify`, {
        channel,
        message: message.trim() || undefined,
      });
      const summary = channelSummary(res.data.notified) || channel;
      onToast?.(`${summary} update sent to ${a.patient_name}.`);
      setMessage('');
      setShowNotify(false);
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveReschedule = () => {
    const iso = new Date(`${date}T${time}`).toISOString();
    patch({ scheduledAt: iso }, 'Rescheduled');
  };

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{a.patient_name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
            <IconClock className="h-4 w-4 text-slate-400" />
            {formatDateTime(a.scheduled_at)} · {a.service_name || 'Consultation'}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {a.physiotherapist_name ? `With ${a.physiotherapist_name}` : 'Unassigned'}
            {a.patient_phone ? ` · ${a.patient_phone}` : ''}
          </p>
        </div>
        <StatusBadge status={a.status} />
      </div>

      {/* Assign a physiotherapist (admin) — only when unassigned or reassigning */}
      {canAssign && physios && (!a.physiotherapist_id || showAssign) && (
        <div className="mt-3">
          <label className="label text-xs">Assign physiotherapist</label>
          <select
            className="input py-1.5 text-sm"
            value={a.physiotherapist_id || ''}
            disabled={busy}
            onChange={(e) => {
              assign(e.target.value);
              setShowAssign(false);
            }}
          >
            <option value="">Unassigned</option>
            {physios.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-slate-100 pt-3">
        {variant === 'admin' && a.status === 'booked' && (!canAssign || a.physiotherapist_id) && (
          <PrimaryButton disabled={busy} onClick={() => patch({ status: 'confirmed' }, 'Confirmed')}>
            Confirm
          </PrimaryButton>
        )}
        {variant === 'admin' && a.status === 'confirmed' && (
          <PrimaryButton disabled={busy} onClick={() => patch({ status: 'checked_in' }, 'Patient checked in')}>
            Check in
          </PrimaryButton>
        )}
        {a.status === 'checked_in' && (
          <PrimaryButton disabled={busy} onClick={() => patch({ status: 'completed' }, 'Marked complete')}>
            Complete
          </PrimaryButton>
        )}
        {variant === 'physio' && a.status === 'confirmed' && (
          <PrimaryButton disabled={busy} onClick={() => patch({ status: 'completed' }, 'Marked complete')}>
            Complete session
          </PrimaryButton>
        )}
        {variant === 'physio' && onOpenNotes && (
          <ActionButton tone="brand" disabled={busy} onClick={() => onOpenNotes(a)}>
            Open notes
          </ActionButton>
        )}
        {variant === 'admin' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => setShowMore((value) => !value)}
            className="ml-auto rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100"
          >
            {showMore ? 'Close' : 'More ···'}
          </button>
        )}
      </div>

      {showMore && variant === 'admin' && (
        <div className="mt-2 flex flex-wrap items-center gap-1 rounded-xl bg-slate-50 p-2">
          {!isClosed && (
            <ActionButton tone="rose" disabled={busy} onClick={() => patch({ status: 'no_show' }, 'Marked missed')}>
              Missed
            </ActionButton>
          )}
          <ActionButton disabled={busy} onClick={() => setShowReschedule((value) => !value)}>
            {isClosed ? 'Rebook' : 'Reschedule'}
          </ActionButton>
          {!isClosed && (
            <ActionButton tone="rose" disabled={busy} onClick={() => patch({ status: 'cancelled' }, 'Cancelled')}>
              Cancel
            </ActionButton>
          )}
          {canAssign && physios && a.physiotherapist_id && !isClosed && (
            <ActionButton disabled={busy} onClick={() => setShowAssign((value) => !value)}>
              Reassign
            </ActionButton>
          )}
          <ActionButton disabled={busy} onClick={() => setShowNotify((value) => !value)}>
            <span className="inline-flex items-center gap-1"><IconChat className="h-4 w-4" /> Notify</span>
          </ActionButton>
        </div>
      )}

      {/* Reschedule panel */}
      {showReschedule && (
        <div className="mt-3 grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_auto]">
          <input type="date" className="input py-1.5 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
          <input type="time" className="input py-1.5 text-sm" value={time} onChange={(e) => setTime(e.target.value)} />
          <button type="button" className="btn-primary py-1.5 text-sm" disabled={busy} onClick={saveReschedule}>
            Save & notify
          </button>
        </div>
      )}

      {/* Notify panel */}
      {showNotify && (
        <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="label mb-0 text-xs">Channel</label>
            <select className="input w-auto py-1 text-sm" value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
            </select>
          </div>
          <textarea
            rows={2}
            className="input text-sm"
            placeholder="Optional message — leave blank to send a standard update."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="button" className="btn-primary py-1.5 text-sm" disabled={busy} onClick={sendNotify}>
            Send {channel === 'call' ? 'call' : 'message'}
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </div>
  );
};

export default AppointmentCard;

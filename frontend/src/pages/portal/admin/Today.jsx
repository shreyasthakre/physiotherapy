import { useEffect, useMemo, useState } from 'react';
import Spinner from '../../../components/Spinner.jsx';
import AppointmentCard from '../../../components/portal/AppointmentCard.jsx';
import { IconClock } from '../../../components/icons.jsx';
import { useAdminData } from '../../../context/AdminDataContext.jsx';

const isSameLocalDay = (iso, date) => {
  const value = new Date(iso);
  return (
    value.getFullYear() === date.getFullYear() &&
    value.getMonth() === date.getMonth() &&
    value.getDate() === date.getDate()
  );
};

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' });

const closedStatuses = new Set(['completed', 'cancelled', 'no_show']);

const Today = () => {
  const {
    appointments,
    appointmentsLoading,
    physios,
    refreshAppointments,
    showToast,
  } = useAdminData();
  const [filter, setFilter] = useState('active');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const today = useMemo(
    () =>
      appointments
        .filter((appointment) => isSameLocalDay(appointment.scheduled_at, now))
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)),
    [appointments, now],
  );

  const waiting = today.filter((appointment) =>
    ['booked', 'confirmed'].includes(appointment.status),
  );
  const checkedIn = today.filter((appointment) => appointment.status === 'checked_in');
  const completed = today.filter((appointment) => appointment.status === 'completed');
  const missed = today.filter((appointment) => appointment.status === 'no_show');
  const needsAssignment = appointments
    .filter(
      (appointment) =>
        appointment.status === 'booked' &&
        !appointment.physiotherapist_id &&
        new Date(appointment.scheduled_at).getTime() >= now.getTime(),
    )
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

  const visible = today.filter((appointment) => {
    if (appointment.status === 'booked' && !appointment.physiotherapist_id) return false;
    if (filter === 'active') return !closedStatuses.has(appointment.status);
    if (filter === 'waiting') return ['booked', 'confirmed'].includes(appointment.status);
    if (filter === 'checked_in') return appointment.status === 'checked_in';
    if (filter === 'closed') return closedStatuses.has(appointment.status);
    return true;
  });

  const isLate = (appointment) =>
    ['booked', 'confirmed'].includes(appointment.status) &&
    now.getTime() > new Date(appointment.scheduled_at).getTime() + 10 * 60_000;

  const stats = [
    { label: 'Expected', value: today.length, tone: 'bg-brand-50 text-brand-700' },
    { label: 'Waiting to arrive', value: waiting.length, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Checked in', value: checkedIn.length, tone: 'bg-violet-50 text-violet-700' },
    { label: 'Completed', value: completed.length, tone: 'bg-teal-50 text-teal-700' },
    { label: 'Missed', value: missed.length, tone: 'bg-rose-50 text-rose-700' },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <IconClock className="h-5 w-5 text-brand-600" /> Today&apos;s front-desk board
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {now.toLocaleDateString('en-AU', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            {' · '}
            {now.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
        <button type="button" className="btn-ghost" onClick={refreshAppointments}>
          Refresh board
        </button>
      </div>

      {needsAssignment.length > 0 && (
        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-amber-900">Needs a physiotherapist</h2>
              <p className="text-sm text-amber-700">Assign these new bookings before the session.</p>
            </div>
            <span className="rounded-full bg-amber-200 px-2.5 py-1 text-xs font-bold text-amber-900">
              {needsAssignment.length}
            </span>
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {needsAssignment.slice(0, 4).map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                physios={physios}
                canAssign
                onChanged={refreshAppointments}
                onToast={showToast}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-2xl p-4 ${stat.tone}`}>
            <p className="text-2xl font-extrabold">{stat.value}</p>
            <p className="text-xs font-semibold">{stat.label}</p>
          </div>
        ))}
      </section>

      <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
        {[
          ['active', 'Active'],
          ['waiting', 'Waiting'],
          ['checked_in', 'Checked in'],
          ['closed', 'Closed'],
          ['all', 'All'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              filter === value
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="mt-4 space-y-3">
        {appointmentsLoading ? (
          <Spinner />
        ) : visible.length > 0 ? (
          visible.map((appointment) => (
            <div
              key={appointment.id}
              className="grid gap-2 md:grid-cols-[72px_minmax(0,1fr)] md:items-start"
            >
              <div className="pt-3 text-center md:text-left">
                <p className="text-lg font-extrabold text-slate-800">
                  {formatTime(appointment.scheduled_at)}
                </p>
                {isLate(appointment) && (
                  <span className="mt-1 inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700">
                    Late
                  </span>
                )}
              </div>
              <AppointmentCard
                appointment={appointment}
                physios={physios}
                canAssign
                onChanged={refreshAppointments}
                onToast={showToast}
              />
            </div>
          ))
        ) : (
          <div className="card p-10 text-center">
            <p className="font-semibold text-slate-700">No sessions in this view.</p>
            <p className="mt-1 text-sm text-slate-500">
              Today&apos;s scheduled sessions will appear here automatically.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Today;

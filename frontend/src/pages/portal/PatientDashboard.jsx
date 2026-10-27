import { useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../../components/Spinner.jsx';
import Alert from '../../components/Alert.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useFetch } from '../../lib/useFetch.js';
import api from '../../lib/api.js';
import { IconCalendar } from '../../components/icons.jsx';

const recordTabs = [
  { key: 'prescription', label: 'Prescriptions' },
  { key: 'exercise_plan', label: 'Exercise Plans' },
  { key: 'progress_report', label: 'Progress Reports' },
];

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' });

const RecordCard = ({ record }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between">
      <h4 className="font-semibold text-slate-900">{record.title}</h4>
      <span className="text-xs text-slate-400">{formatDateTime(record.created_at)}</span>
    </div>
    {record.body && <p className="mt-2 text-sm text-slate-600">{record.body}</p>}

    {record.type === 'exercise_plan' && Array.isArray(record.data?.exercises) && (
      <ul className="mt-3 space-y-1 text-sm text-slate-600">
        {record.data.exercises.map((ex, i) => (
          <li key={i} className="flex justify-between rounded-lg bg-slate-50 px-3 py-1.5">
            <span>{ex.name}</span>
            <span className="text-slate-400">{ex.sets} × {ex.reps}</span>
          </li>
        ))}
      </ul>
    )}

    {record.type === 'progress_report' && record.data?.recordKind === 'session_note' && (
      <div className="mt-3 space-y-2 text-sm text-slate-600">
        {record.data.modalities?.length > 0 && (
          <p><strong>Modalities:</strong> {record.data.modalities.join(', ')}</p>
        )}
        {record.data.exercisesDone?.length > 0 && (
          <div>
            <strong>Exercises completed:</strong>
            <ul className="mt-1 list-disc pl-5">
              {record.data.exercisesDone.map((exercise) => <li key={exercise}>{exercise}</li>)}
            </ul>
          </div>
        )}
        {record.data.response && <p><strong>Next plan:</strong> {record.data.response}</p>}
        <p className="font-semibold text-brand-700">{record.data.sessionsRemaining} sessions remaining</p>
      </div>
    )}

    {record.type === 'progress_report' && record.data && record.data.recordKind !== 'session_note' && (
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        {Object.entries(record.data).map(([k, v]) => (
          <div key={k} className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-xs uppercase text-slate-400">{k}</dt>
            <dd className="font-medium text-slate-800">{String(v)}</dd>
          </div>
        ))}
      </dl>
    )}

    {record.physiotherapist_name && (
      <p className="mt-3 text-xs text-slate-400">by {record.physiotherapist_name}</p>
    )}
  </div>
);

const PatientDashboard = () => {
  const { data: appointments, loading: apptLoading, refetch } = useFetch('/appointments', {
    select: (d) => d.appointments,
  });
  const { data: records, loading: recLoading } = useFetch('/patients/me/records', {
    select: (d) => d.records,
  });
  const [tab, setTab] = useState('exercise_plan');
  const [showHistory, setShowHistory] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const cancelAppointment = async (id) => {
    setCancelError('');
    try {
      await api.patch(`/appointments/${id}`, { status: 'cancelled' });
      refetch();
    } catch (err) {
      setCancelError(err.message);
    }
  };

  const filteredRecords = (records || []).filter((r) => r.type === tab);
  const activeStatuses = new Set(['booked', 'confirmed', 'checked_in']);
  const sortedAppointments = [...(appointments || [])].sort(
    (a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at),
  );
  const nextAppointment = sortedAppointments.find(
    (appointment) =>
      activeStatuses.has(appointment.status) &&
      new Date(appointment.scheduled_at).getTime() >= Date.now() - 60 * 60 * 1000,
  );
  const history = [...(appointments || [])]
    .filter((appointment) => appointment.id !== nextAppointment?.id)
    .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Your next visit</h2>
          <Link to="/portal/booking" className="btn-primary">
            <IconCalendar /> New booking
          </Link>
        </div>

        {cancelError && <div className="mt-4"><Alert type="error">{cancelError}</Alert></div>}

        <div className="mt-5">
          {apptLoading ? (
            <Spinner />
          ) : nextAppointment ? (
            <div className="card overflow-hidden border-brand-100">
              <div className="bg-gradient-to-br from-brand-600 to-teal-600 p-6 text-white">
                <p className="text-sm font-semibold text-white/80">Next appointment</p>
                <p className="mt-1 text-2xl font-extrabold">{formatDateTime(nextAppointment.scheduled_at)}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div>
                  <p className="font-bold text-slate-900">{nextAppointment.service_name || 'Physiotherapy session'}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {nextAppointment.physiotherapist_name || 'Physiotherapist to be assigned'}
                  </p>
                  <div className="mt-3"><StatusBadge status={nextAppointment.status} /></div>
                </div>
                {['booked', 'confirmed'].includes(nextAppointment.status) && (
                  <button
                    type="button"
                    onClick={() => cancelAppointment(nextAppointment.id)}
                    className="btn-ghost text-rose-600"
                  >
                    Cancel visit
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
              No upcoming visit.{' '}
              <Link to="/portal/booking" className="font-semibold text-brand-700">Book one now</Link>.
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900">Your care plan</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {recordTabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === t.key ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {recLoading ? (
            <Spinner />
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map((r) => <RecordCard key={r.id} record={r} />)
          ) : (
            <p className="text-slate-500">No {recordTabs.find((t) => t.key === tab)?.label.toLowerCase()} yet.</p>
          )}
        </div>
      </section>

      {history.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => setShowHistory((value) => !value)}
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            {showHistory ? 'Hide visit history' : `Show visit history (${history.length})`}
          </button>
          {showHistory && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white">
              {history.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-0">
                  <div>
                    <p className="font-medium text-slate-800">{appointment.service_name || 'Physiotherapy session'}</p>
                    <p className="text-sm text-slate-500">{formatDateTime(appointment.scheduled_at)}</p>
                  </div>
                  <StatusBadge status={appointment.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default PatientDashboard;

import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Spinner from '../../../components/Spinner.jsx';
import AppointmentCard from '../../../components/portal/AppointmentCard.jsx';
import ScheduleSessionForm from '../../../components/portal/ScheduleSessionForm.jsx';
import { useAdminData } from '../../../context/AdminDataContext.jsx';
import { buildPatientStats, isRegular } from '../../../lib/patientGroups.js';

const PATIENT_TYPES = [
  ['all', 'Everyone'],
  ['regular', 'Regulars'],
  ['new', 'New / one-off'],
];

const Appointments = () => {
  const {
    appointments,
    appointmentsLoading,
    patients,
    physios,
    services,
    refreshAppointments,
    refreshUsers,
    showToast,
  } = useAdminData();

  const location = useLocation();
  const [query, setQuery] = useState('');
  const [patientType, setPatientType] = useState('all'); // all | regular | new
  const [showSchedule, setShowSchedule] = useState(true);

  const now = Date.now();
  const q = query.trim().toLowerCase();

  const stats = useMemo(() => buildPatientStats(appointments), [appointments]);

  const filtered = appointments
    .filter((a) => {
      if (patientType !== 'all') {
        const regular = isRegular(stats.get(a.patient_id));
        if (patientType === 'regular' && !regular) return false;
        if (patientType === 'new' && regular) return false;
      }
      const isPast =
        a.status === 'completed' ||
        a.status === 'cancelled' ||
        a.status === 'no_show' ||
        new Date(a.scheduled_at).getTime() < now;
      if (isPast) return false;
      if (q) {
        const hay = `${a.patient_name} ${a.patient_phone || ''} ${a.service_name || ''} ${a.physiotherapist_name || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((x, y) => new Date(x.scheduled_at) - new Date(y.scheduled_at));

  const afterSchedule = () => {
    refreshAppointments();
    refreshUsers();
    setShowSchedule(false);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Book a session</h1>
          <p className="mt-1 text-sm text-slate-500">Schedule a new visit, then review upcoming bookings below.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowSchedule((v) => !v)}>
          {showSchedule ? 'Close' : '+ Schedule a session'}
        </button>
      </div>

      {showSchedule && (
        <div className="mt-4">
          <ScheduleSessionForm
            patients={patients}
            physios={physios}
            services={services}
            defaultPatientId={location.state?.patientId}
            onScheduled={afterSchedule}
          />
        </div>
      )}

      <h2 className="mt-8 text-base font-bold text-slate-900">Upcoming appointments</h2>

      {/* Keep regulars and new/one-off patients from mixing */}
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
        {PATIENT_TYPES.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setPatientType(value)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              patientType === value ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          className="input max-w-xs"
          placeholder="Search patient, phone, service…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="ml-auto text-sm text-slate-400">{filtered.length} result{filtered.length === 1 ? '' : 's'}</span>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {appointmentsLoading ? (
          <Spinner />
        ) : filtered.length > 0 ? (
          filtered.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              physios={physios}
              canAssign
              onChanged={refreshAppointments}
              onToast={showToast}
            />
          ))
        ) : (
          <div className="card p-8 text-center text-slate-500 lg:col-span-2">
            No appointments match your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;

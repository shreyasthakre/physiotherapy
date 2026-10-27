import Spinner from '../../../components/Spinner.jsx';
import AppointmentCard from '../../../components/portal/AppointmentCard.jsx';
import { useAdminData } from '../../../context/AdminDataContext.jsx';

const Consultations = () => {
  const { appointments, appointmentsLoading, physios, refreshAppointments, showToast } = useAdminData();

  const newConsultations = appointments
    .filter((a) => a.status === 'booked')
    .sort((x, y) => new Date(x.scheduled_at) - new Date(y.scheduled_at));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">New appointments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Newly booked sessions awaiting triage. Assign a physiotherapist, confirm, reschedule or
            cancel — the patient is notified automatically.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          {newConsultations.length} awaiting
        </span>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {appointmentsLoading ? (
          <Spinner />
        ) : newConsultations.length > 0 ? (
          newConsultations.map((a) => (
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
            No new appointments right now.
          </div>
        )}
      </div>
    </div>
  );
};

export default Consultations;

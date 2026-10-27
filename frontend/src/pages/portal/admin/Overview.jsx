import { Link } from 'react-router-dom';
import { useAdminData } from '../../../context/AdminDataContext.jsx';
import { IconClock, IconCalendar, IconHeart } from '../../../components/icons.jsx';

const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString();
const closed = new Set(['completed', 'cancelled', 'no_show']);

const StatCard = ({ icon: Icon, label, value, tone, to }) => (
  <Link to={to} className="card flex items-center gap-4 p-5 transition hover:shadow-md">
    <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
      <Icon />
    </span>
    <div>
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </Link>
);

const Overview = () => {
  const { appointments, appointmentsLoading, patients } = useAdminData();

  const now = Date.now();
  const newConsults = appointments.filter((a) => a.status === 'booked');
  const todays = appointments.filter((a) => isToday(a.scheduled_at) && a.status !== 'cancelled');
  const todayWaiting = todays.filter((a) => a.status === 'booked' || a.status === 'confirmed');
  const todayCheckedIn = todays.filter((a) => a.status === 'checked_in');
  const todayDone = todays.filter((a) => a.status === 'completed');
  const upcoming = appointments.filter(
    (a) => !closed.has(a.status) && new Date(a.scheduled_at).getTime() >= now,
  );

  const val = (n) => (appointmentsLoading ? '…' : n);

  return (
    <div className="space-y-8">
      {/* Snapshot — each card jumps to the full page */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={IconClock} label="New appointments" value={val(newConsults.length)} tone="bg-amber-50 text-amber-700" to="/admin/new" />
        <StatCard icon={IconCalendar} label="Sessions today" value={val(todays.length)} tone="bg-brand-50 text-brand-700" to="/admin/today" />
        <StatCard icon={IconCalendar} label="Upcoming sessions" value={val(upcoming.length)} tone="bg-teal-50 text-teal-700" to="/admin/appointments" />
        <StatCard icon={IconHeart} label="Patients" value={patients.length} tone="bg-violet-50 text-violet-700" to="/admin/patients" />
      </section>

      {/* Needs attention — the two things an admin acts on daily */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card flex flex-col p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900">New appointments</h2>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                newConsults.length ? 'bg-amber-50 text-amber-700' : 'bg-teal-50 text-teal-700'
              }`}
            >
              {newConsults.length ? `${newConsults.length} waiting` : 'All clear'}
            </span>
          </div>
          <p className="mt-2 flex-1 text-sm text-slate-500">
            {newConsults.length
              ? 'New bookings that still need a physiotherapist assigned.'
              : 'No new appointments to review right now.'}
          </p>
          <Link to="/admin/new" className="btn-ghost mt-4 self-start">
            Review &amp; assign →
          </Link>
        </div>

        <div className="card flex flex-col p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900">Today at the clinic</h2>
            <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              {todays.length} today
            </span>
          </div>
          <p className="mt-2 flex-1 text-sm text-slate-500">
            {todays.length
              ? `${todayWaiting.length} waiting · ${todayCheckedIn.length} checked in · ${todayDone.length} done`
              : 'No sessions scheduled for today.'}
          </p>
          <Link to="/admin/today" className="btn-ghost mt-4 self-start">
            Open today&apos;s board →
          </Link>
        </div>
      </section>

      {/* One clear primary action */}
      <section className="card flex flex-wrap items-center justify-between gap-4 bg-gradient-to-br from-brand-600 to-teal-600 p-6 text-white">
        <div>
          <h2 className="text-lg font-bold">Schedule a session</h2>
          <p className="mt-1 text-sm text-white/80">
            Book a patient in — they&apos;re notified automatically by SMS, WhatsApp and email.
          </p>
        </div>
        <Link
          to="/admin/appointments"
          state={{ schedule: true }}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-white/90"
        >
          + New session
        </Link>
      </section>
    </div>
  );
};

export default Overview;

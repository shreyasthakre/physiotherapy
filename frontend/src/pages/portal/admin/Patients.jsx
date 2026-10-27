import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../../../components/Spinner.jsx';
import Alert from '../../../components/Alert.jsx';
import api from '../../../lib/api.js';
import { useAdminData } from '../../../context/AdminDataContext.jsx';
import { buildPatientStats, isRegular, formatNext } from '../../../lib/patientGroups.js';

const emptyPatient = { fullName: '', phone: '', email: '' };

const GroupTag = ({ regular }) => (
  <span
    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
      regular ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
    }`}
  >
    {regular ? 'Regular' : 'New'}
  </span>
);

const Patients = () => {
  const { patients, usersLoading, appointments, refreshUsers, showToast } = useAdminData();

  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('regular'); // all | regular | new — regulars are the focus
  const [showRegister, setShowRegister] = useState(false);
  const [newPatient, setNewPatient] = useState(emptyPatient);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [visible, setVisible] = useState(20);

  const stats = useMemo(() => buildPatientStats(appointments), [appointments]);

  const { regulars, newcomers } = useMemo(() => {
    const reg = [];
    const nw = [];
    for (const p of patients) (isRegular(stats.get(p.id)) ? reg : nw).push(p);
    return { regulars: reg, newcomers: nw };
  }, [patients, stats]);

  const q = query.trim().toLowerCase();
  const base = group === 'regular' ? regulars : group === 'new' ? newcomers : patients;
  const filtered = base.filter((p) =>
    q ? `${p.full_name} ${p.email || ''} ${p.phone || ''}`.toLowerCase().includes(q) : true,
  );
  const shown = filtered.slice(0, visible);

  const tabs = [
    ['all', 'All', patients.length],
    ['regular', 'Regulars', regulars.length],
    ['new', 'New / one-off', newcomers.length],
  ];

  const registerPatient = async (e) => {
    e.preventDefault();
    setRegistering(true);
    setRegisterError('');
    try {
      await api.post('/admin/patients', {
        fullName: newPatient.fullName.trim(),
        phone: newPatient.phone.trim(),
        email: newPatient.email.trim() || undefined,
      });
      setNewPatient(emptyPatient);
      setShowRegister(false);
      showToast('Patient registered.');
      refreshUsers();
    } catch (err) {
      setRegisterError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Patients</h1>
          <p className="mt-1 text-sm text-slate-500">
            Regulars have an ongoing course or a session already lined up. New / one-off are single
            or first-time bookings.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowRegister((v) => !v)}>
          {showRegister ? 'Close' : '+ Register patient'}
        </button>
      </div>

      {showRegister && (
        <form onSubmit={registerPatient} className="card mt-4 space-y-3 p-5">
          {registerError && <Alert type="error">{registerError}</Alert>}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="np-name" className="label">Full name</label>
              <input
                id="np-name"
                className="input"
                required
                value={newPatient.fullName}
                onChange={(e) => setNewPatient((p) => ({ ...p, fullName: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="np-phone" className="label">Mobile number</label>
              <input
                id="np-phone"
                className="input"
                required
                placeholder="+61 400 000 000"
                value={newPatient.phone}
                onChange={(e) => setNewPatient((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="np-email" className="label">Email (optional)</label>
              <input
                id="np-email"
                type="email"
                className="input"
                value={newPatient.email}
                onChange={(e) => setNewPatient((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={registering}>
            {registering ? 'Registering…' : 'Register patient'}
          </button>
        </form>
      )}

      {/* Group tabs keep regulars and new patients from mixing together */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {tabs.map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
              setGroup(value);
              setVisible(20);
            }}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                group === value ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label} <span className="text-slate-400">({count})</span>
            </button>
          ))}
        </div>
        <input
          className="input max-w-xs"
          placeholder="Search patients…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(20);
          }}
        />
        <span className="ml-auto text-sm text-slate-400">
          Showing {Math.min(shown.length, filtered.length)} of {filtered.length}
        </span>
      </div>

      <div className="mt-4 max-h-[70vh] space-y-2 overflow-y-auto pr-1">
        {usersLoading ? (
          <Spinner />
        ) : shown.length > 0 ? (
          shown.map((p) => {
            const s = stats.get(p.id);
            const regular = isRegular(s);
            return (
              <div key={p.id} className="card flex items-center gap-3 p-4">
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-slate-800">{p.full_name}</p>
                        <GroupTag regular={regular} />
                      </div>
                      <p className="truncate text-sm text-slate-500">
                        {p.phone || 'No phone'} · {p.email || 'No email'}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-slate-500">
                        {s?.next ? (
                          <>
                            Next session:{' '}
                            <span className="text-brand-700">{formatNext(s.next.scheduled_at)}</span>
                          </>
                        ) : (
                          <span className="text-slate-400">No upcoming session</span>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                        {s?.upcoming || 0} upcoming
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/admin/appointments"
                    state={{ schedule: true, patientId: p.id }}
                    className="btn-ghost shrink-0"
                  >
                    + Book
                  </Link>
              </div>
            );
          })
        ) : (
          <div className="card p-8 text-center text-slate-500">No patients found.</div>
        )}
      </div>
      {filtered.length > visible && (
        <button
          type="button"
          className="mt-3 w-full text-sm font-semibold text-brand-700"
          onClick={() => setVisible((count) => count + 20)}
        >
          Show more ({filtered.length - visible} left)
        </button>
      )}
    </div>
  );
};

export default Patients;

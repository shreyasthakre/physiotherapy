import { useMemo, useState } from 'react';

const PAGE_SIZE = 12;

const matchesQuery = (patient, query) => {
  if (!query) return true;
  const hay = `${patient.full_name} ${patient.phone || ''} ${patient.email || ''}`.toLowerCase();
  return hay.includes(query);
};

/**
 * Search-first patient picker. Clinics can have hundreds of patients, so we
 * never dump the full list as chips: search, filter, then a short scrollable list.
 */
const PatientFinder = ({
  patients = [],
  appointments = [],
  selectedId,
  onSelect,
  loading = false,
}) => {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('today');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const todayKey = new Date().toDateString();
  const q = query.trim().toLowerCase();

  const ranked = useMemo(() => {
    const todayIds = new Set();
    const assignedIds = new Set();
    const lastSeen = new Map();

    for (const appointment of appointments) {
      if (!appointment.patient_id) continue;
      assignedIds.add(appointment.patient_id);
      const when = new Date(appointment.scheduled_at);
      if (when.toDateString() === todayKey) todayIds.add(appointment.patient_id);
      const prev = lastSeen.get(appointment.patient_id) || 0;
      if (when.getTime() > prev) lastSeen.set(appointment.patient_id, when.getTime());
    }

    const inScope = patients.filter((patient) => {
      if (scope === 'today') return todayIds.has(patient.id);
      if (scope === 'assigned') return assignedIds.has(patient.id);
      return true;
    });

    return inScope
      .filter((patient) => matchesQuery(patient, q))
      .sort((a, b) => {
        const aToday = todayIds.has(a.id) ? 1 : 0;
        const bToday = todayIds.has(b.id) ? 1 : 0;
        if (aToday !== bToday) return bToday - aToday;
        return (lastSeen.get(b.id) || 0) - (lastSeen.get(a.id) || 0);
      });
  }, [appointments, patients, q, scope, todayKey]);

  const shown = ranked.slice(0, visible);

  return (
    <div className="card p-4">
      <label htmlFor="patient-search" className="label">Find a patient</label>
      <input
        id="patient-search"
        className="input"
        autoComplete="off"
        placeholder="Search name, phone or email…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setVisible(PAGE_SIZE);
        }}
      />

      <div className="mt-3 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
        {[
          ['today', 'Today'],
          ['assigned', 'My patients'],
          ['all', 'All'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setScope(value);
              setVisible(PAGE_SIZE);
            }}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              scope === value ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {loading ? 'Loading…' : `${ranked.length} match${ranked.length === 1 ? '' : 'es'} · showing ${shown.length}`}
      </p>

      <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-100">
        {loading ? (
          <p className="p-4 text-sm text-slate-500">Loading patients…</p>
        ) : shown.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">
            {q ? 'No patient matches that search.' : 'No patients in this view. Search All, or pick someone from today’s list.'}
          </p>
        ) : (
          shown.map((patient) => (
            <button
              key={patient.id}
              type="button"
              onClick={() => onSelect(patient)}
              className={`flex w-full items-start justify-between gap-3 border-b border-slate-100 px-3 py-2.5 text-left last:border-0 ${
                selectedId === patient.id ? 'bg-brand-50' : 'hover:bg-slate-50'
              }`}
            >
              <span>
                <span className="block font-semibold text-slate-800">{patient.full_name}</span>
                <span className="block text-xs text-slate-400">
                  {patient.phone || 'No phone'}
                  {patient.email ? ` · ${patient.email}` : ''}
                </span>
              </span>
              {selectedId === patient.id && (
                <span className="shrink-0 text-xs font-bold text-brand-700">Selected</span>
              )}
            </button>
          ))
        )}
      </div>

      {ranked.length > visible && (
        <button
          type="button"
          className="mt-3 w-full text-sm font-semibold text-brand-700"
          onClick={() => setVisible((count) => count + PAGE_SIZE)}
        >
          Show more ({ranked.length - visible} left)
        </button>
      )}
    </div>
  );
};

export default PatientFinder;

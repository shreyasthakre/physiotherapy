import { useRef, useState } from 'react';
import Spinner from '../../components/Spinner.jsx';
import Alert from '../../components/Alert.jsx';
import Toast from '../../components/Toast.jsx';
import AppointmentCard from '../../components/portal/AppointmentCard.jsx';
import PatientFinder from '../../components/portal/PatientFinder.jsx';
import { useFetch } from '../../lib/useFetch.js';
import api from '../../lib/api.js';

const MODALITIES = ['TECAR', 'Laser', 'IFT', 'Ultrasound', 'TENS', 'Shockwave', 'Manual therapy'];

const emptySessionNote = () => ({
  summary: '',
  exercises: '',
  modalities: [],
  otherModality: '',
  response: '',
  sessionsRemaining: '',
});

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

const SessionNoteCard = ({ record }) => {
  const data = record.data || {};
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900">{record.title}</p>
          <p className="text-xs text-slate-400">{formatDate(data.sessionDate || record.created_at)}</p>
        </div>
        {data.sessionsRemaining !== undefined && (
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
            {data.sessionsRemaining} sessions left
          </span>
        )}
      </div>
      {record.body && <p className="mt-3 text-sm text-slate-600">{record.body}</p>}
      {data.modalities?.length > 0 && (
        <p className="mt-2 text-sm text-slate-600"><strong>Modalities:</strong> {data.modalities.join(', ')}</p>
      )}
      {data.exercisesDone?.length > 0 && (
        <div className="mt-2 text-sm text-slate-600">
          <strong>Exercises:</strong>
          <ul className="mt-1 list-disc pl-5">
            {data.exercisesDone.map((exercise) => <li key={exercise}>{exercise}</li>)}
          </ul>
        </div>
      )}
      {data.response && <p className="mt-2 text-sm text-slate-600"><strong>Response:</strong> {data.response}</p>}
    </div>
  );
};

const PhysioDashboard = () => {
  const { data: appointments, loading: apptLoading, refetch: refetchAppts } = useFetch('/appointments', {
    select: (d) => d.appointments,
  });
  const { data: patients, loading: patientsLoading } = useFetch('/patients', {
    select: (d) => d.patients,
  });

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [form, setForm] = useState(emptySessionNote);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const notesRef = useRef(null);

  const upcoming = (appointments || [])
    .filter((a) => a.status === 'booked' || a.status === 'confirmed' || a.status === 'checked_in')
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
  const today = upcoming.filter(
    (appointment) => new Date(appointment.scheduled_at).toDateString() === new Date().toDateString(),
  );
  const past = (appointments || []).filter(
    (a) => a.status === 'completed' || a.status === 'cancelled' || a.status === 'no_show',
  );
  const selectedAppointments = (appointments || []).filter(
    (appointment) => appointment.patient_id === selectedPatient?.id,
  );
  const completedCount = selectedAppointments.filter((appointment) => appointment.status === 'completed').length;
  const scheduledRemaining = selectedAppointments.filter((appointment) =>
    ['booked', 'confirmed', 'checked_in'].includes(appointment.status),
  ).length;
  const sessionNotes = records.filter((record) => record.data?.recordKind === 'session_note');

  const loadRecords = async (patient) => {
    if (!patient) return;
    setSelectedPatient(patient);
    setRecordsLoading(true);
    setFeedback('');
    setError('');
    notesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try {
      const res = await api.get(`/patients/${patient.id}/records`);
      setRecords(res.data.records);
      const latestSessionNote = res.data.records.find((record) => record.data?.recordKind === 'session_note');
      const patientSessionsLeft = (appointments || []).filter(
        (appointment) =>
          appointment.patient_id === patient.id &&
          ['booked', 'confirmed', 'checked_in'].includes(appointment.status),
      ).length;
      setForm({
        ...emptySessionNote(),
        sessionsRemaining: String(latestSessionNote?.data?.sessionsRemaining ?? patientSessionsLeft),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setRecordsLoading(false);
    }
  };

  const submitRecord = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setError('');
    setFeedback('');
    try {
      const exercisesDone = form.exercises
        .split('\n')
        .map((exercise) => exercise.trim())
        .filter(Boolean);
      const modalities = [...form.modalities];
      if (form.otherModality.trim()) modalities.push(form.otherModality.trim());

      await api.post(`/patients/${selectedPatient.id}/records`, {
        type: 'progress_report',
        title: `Session note — ${new Date().toLocaleDateString('en-AU')}`,
        body: form.summary.trim(),
        data: {
          recordKind: 'session_note',
          sessionDate: new Date().toISOString(),
          exercisesDone,
          modalities,
          response: form.response.trim(),
          sessionsRemaining: Number(form.sessionsRemaining || 0),
        },
      });
      setForm(emptySessionNote());
      setFeedback('Today’s session note saved.');
      loadRecords(selectedPatient);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-10">
      <Toast message={toast} onClose={() => setToast('')} />

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Today&apos;s patients</h2>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            {today.length} today
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Focus on treatment and clinical notes. Reception manages arrivals, booking changes and messages.
        </p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {apptLoading ? (
            <Spinner />
          ) : today.length > 0 ? (
            today.map((a) => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                variant="physio"
                onChanged={refetchAppts}
                onToast={setToast}
                onOpenNotes={() => {
                  const patient = (patients || []).find((item) => item.id === a.patient_id);
                  if (patient) loadRecords(patient);
                }}
              />
            ))
          ) : (
            <div className="card p-6 text-slate-500">No patients scheduled for today.</div>
          )}
        </div>
      </section>

      <section ref={notesRef}>
        <h2 className="text-xl font-bold text-slate-900">Clinical notes</h2>
        <p className="mt-1 text-sm text-slate-500">
          Search instead of scrolling names. Start with today&apos;s list, or look up a regular by name or phone.
        </p>
        {error && <div className="mt-3"><Alert type="error">{error}</Alert></div>}
        {feedback && <div className="mt-3"><Alert type="success">{feedback}</Alert></div>}

        <div className="mt-4 grid gap-4">
          <PatientFinder
            patients={patients || []}
            appointments={appointments || []}
            selectedId={selectedPatient?.id}
            onSelect={loadRecords}
            loading={patientsLoading}
          />

          {selectedPatient && (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
              <div className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Today&apos;s session</p>
                    <h3 className="text-lg font-bold text-slate-900">{selectedPatient.full_name}</h3>
                  </div>
                  <div className="flex gap-2 text-center">
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <p className="text-lg font-extrabold text-slate-900">{completedCount}</p>
                      <p className="text-[10px] font-semibold uppercase text-slate-400">Completed</p>
                    </div>
                    <div className="rounded-xl bg-brand-50 px-3 py-2">
                      <p className="text-lg font-extrabold text-brand-700">{scheduledRemaining}</p>
                      <p className="text-[10px] font-semibold uppercase text-brand-500">Scheduled</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={submitRecord} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="session-summary" className="label">What was done today?</label>
                    <textarea
                      id="session-summary"
                      rows={3}
                      className="input"
                      required
                      placeholder="Assessment, manual treatment and progress made in this session…"
                      value={form.summary}
                      onChange={(e) => setForm((current) => ({ ...current, summary: e.target.value }))}
                    />
                  </div>

                  <fieldset>
                    <legend className="label">Modalities used</legend>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {MODALITIES.map((modality) => (
                        <label key={modality} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={form.modalities.includes(modality)}
                            onChange={(e) =>
                              setForm((current) => ({
                                ...current,
                                modalities: e.target.checked
                                  ? [...current.modalities, modality]
                                  : current.modalities.filter((value) => value !== modality),
                              }))
                            }
                          />
                          {modality}
                        </label>
                      ))}
                    </div>
                    <input
                      className="input mt-2"
                      placeholder="Other modality (optional)"
                      value={form.otherModality}
                      onChange={(e) => setForm((current) => ({ ...current, otherModality: e.target.value }))}
                    />
                  </fieldset>

                  <div>
                    <label htmlFor="session-exercises" className="label">Exercises completed today</label>
                    <textarea
                      id="session-exercises"
                      rows={4}
                      className="input"
                      placeholder={'One exercise per line\nExample: Heel raises — 3 × 10'}
                      value={form.exercises}
                      onChange={(e) => setForm((current) => ({ ...current, exercises: e.target.value }))}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                    <div>
                      <label htmlFor="session-response" className="label">Patient response / next plan</label>
                      <textarea
                        id="session-response"
                        rows={2}
                        className="input"
                        placeholder="Pain response, progress and focus for next visit…"
                        value={form.response}
                        onChange={(e) => setForm((current) => ({ ...current, response: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label htmlFor="sessions-left" className="label">Sessions remaining</label>
                      <input
                        id="sessions-left"
                        type="number"
                        min="0"
                        className="input"
                        value={form.sessionsRemaining}
                        onChange={(e) => setForm((current) => ({ ...current, sessionsRemaining: e.target.value }))}
                      />
                      <p className="mt-1 text-xs text-slate-400">{scheduledRemaining} currently scheduled</p>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary">Save today&apos;s session</button>
                </form>
              </div>

              <div className="card p-5">
                <h3 className="font-bold text-slate-900">Past treatment</h3>
                <p className="mt-1 text-sm text-slate-500">What was completed in earlier sessions.</p>
                <div className="mt-4 space-y-3">
                  {recordsLoading ? (
                    <Spinner />
                  ) : sessionNotes.length > 0 ? (
                    sessionNotes.map((record) => <SessionNoteCard key={record.id} record={record} />)
                  ) : (
                    <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                      No structured session notes yet.
                    </div>
                  )}
                </div>

                {records.some((record) => record.data?.recordKind !== 'session_note') && (
                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Other care records</h4>
                    <div className="mt-2 space-y-2">
                      {records
                        .filter((record) => record.data?.recordKind !== 'session_note')
                        .map((record) => (
                          <div key={record.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                            <span className="font-medium text-slate-800">{record.title}</span>
                            <span className="ml-2 text-xs text-slate-400">({record.type.replace('_', ' ')})</span>
                            {record.body && <p className="mt-1 text-slate-600">{record.body}</p>}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-slate-900">Recent sessions</h2>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {past.slice(0, 3).map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                variant="physio"
                onChanged={refetchAppts}
                onToast={setToast}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default PhysioDashboard;

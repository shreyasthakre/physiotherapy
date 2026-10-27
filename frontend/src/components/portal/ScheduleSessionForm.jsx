import { useState } from 'react';
import Alert from '../Alert.jsx';
import { IconCalendar } from '../icons.jsx';
import api from '../../lib/api.js';

const emptyForm = {
  patientId: '',
  newName: '',
  newPhone: '',
  newEmail: '',
  serviceId: '',
  physiotherapistId: '',
  date: '',
  time: '',
  reason: '',
};

const channelSummary = (notified) => {
  if (!notified?.sent?.length) return null;
  const names = { whatsapp: 'WhatsApp', sms: 'SMS', email: 'email', call: 'call' };
  const unique = [...new Set(notified.sent.map((s) => names[s.channel] || s.channel))];
  return unique.join(' + ');
};

/**
 * Staff form to schedule a session. The patient can be an existing record or
 * a brand-new walk-in / phone patient registered on the spot (name + mobile).
 * On success the patient is auto-notified (WhatsApp + SMS + email).
 */
const ScheduleSessionForm = ({
  patients,
  physios,
  services,
  defaultPhysioId,
  defaultPatientId,
  lockPhysio = false,
  onScheduled,
}) => {
  const [mode, setMode] = useState('existing'); // 'existing' | 'new'
  const [form, setForm] = useState({
    ...emptyForm,
    physiotherapistId: defaultPhysioId || '',
    patientId: defaultPatientId || '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const reset = () => setForm({ ...emptyForm, physiotherapistId: defaultPhysioId || '' });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.date || !form.time) {
      setError('Please choose a date and arrival time.');
      return;
    }
    if (mode === 'existing' && !form.patientId) {
      setError('Please choose a patient, or register a new one.');
      return;
    }
    if (mode === 'new' && (!form.newName.trim() || !form.newPhone.trim())) {
      setError('Please enter the new patient’s name and mobile number.');
      return;
    }

    setBusy(true);
    try {
      let patientId = form.patientId;
      let patientName;
      let credentialNote = '';

      // Register a new patient first, if needed.
      if (mode === 'new') {
        const res = await api.post('/admin/patients', {
          fullName: form.newName.trim(),
          phone: form.newPhone.trim(),
          email: form.newEmail.trim() || undefined,
        });
        patientId = res.data.patient.id;
        patientName = res.data.patient.full_name;
        if (res.data.tempPassword) {
          credentialNote = ` Portal login: ${res.data.patient.email} / ${res.data.tempPassword}.`;
        }
      } else {
        patientName = patients.find((p) => p.id === patientId)?.full_name;
      }

      const scheduledAt = new Date(`${form.date}T${form.time}`).toISOString();
      const res = await api.post('/appointments', {
        patientId,
        serviceId: form.serviceId || undefined,
        physiotherapistId: form.physiotherapistId || undefined,
        scheduledAt,
        reason: form.reason || undefined,
      });

      const summary = channelSummary(res.data.notified);
      setSuccess(
        `${mode === 'new' ? 'Patient registered and session' : 'Session'} scheduled${
          summary ? ` — ${summary} confirmation sent to ${patientName || 'the patient'}` : ''
        }.${credentialNote}`,
      );
      reset();
      setMode('existing');
      onScheduled?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const tabClass = (active) =>
    `flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
      active ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
    }`;

  return (
    <div className="card p-5">
      <h3 className="flex items-center gap-2 font-bold text-slate-900">
        <IconCalendar className="h-5 w-5 text-brand-600" /> Schedule a session
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Book a patient in and we&apos;ll auto-notify them by WhatsApp, SMS and email.
      </p>

      {error && <div className="mt-3"><Alert type="error">{error}</Alert></div>}
      {success && <div className="mt-3"><Alert type="success">{success}</Alert></div>}

      <form onSubmit={submit} className="mt-4 space-y-3">
        {/* Existing vs new patient toggle */}
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          <button type="button" className={tabClass(mode === 'existing')} onClick={() => setMode('existing')}>
            Existing patient
          </button>
          <button type="button" className={tabClass(mode === 'new')} onClick={() => setMode('new')}>
            New patient
          </button>
        </div>

        {mode === 'existing' ? (
          <div>
            <label htmlFor="sch-patient" className="label">Patient</label>
            <select id="sch-patient" className="input" value={form.patientId} onChange={update('patientId')}>
              <option value="">Select a patient…</option>
              {(patients || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}{p.phone ? ` — ${p.phone}` : ''}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="grid gap-3 rounded-xl bg-slate-50 p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="sch-name" className="label">Full name</label>
                <input
                  id="sch-name"
                  className="input"
                  value={form.newName}
                  onChange={update('newName')}
                  placeholder="e.g. Aarav Sharma"
                />
              </div>
              <div>
                <label htmlFor="sch-phone" className="label">Mobile number</label>
                <input
                  id="sch-phone"
                  type="tel"
                  className="input"
                  value={form.newPhone}
                  onChange={update('newPhone')}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
            </div>
            <div>
              <label htmlFor="sch-email" className="label">Email (optional)</label>
              <input
                id="sch-email"
                type="email"
                className="input"
                value={form.newEmail}
                onChange={update('newEmail')}
                placeholder="For portal login & email updates"
              />
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="sch-service" className="label">Service</label>
            <select id="sch-service" className="input" value={form.serviceId} onChange={update('serviceId')}>
              <option value="">General consultation</option>
              {(services || []).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          {!lockPhysio && (
            <div>
              <label htmlFor="sch-physio" className="label">Physiotherapist</label>
              <select id="sch-physio" className="input" value={form.physiotherapistId} onChange={update('physiotherapistId')}>
                <option value="">Unassigned</option>
                {(physios || []).map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="sch-date" className="label">Date</label>
            <input id="sch-date" type="date" className="input" value={form.date} onChange={update('date')} required />
          </div>
          <div>
            <label htmlFor="sch-time" className="label">Arrival time</label>
            <input id="sch-time" type="time" className="input" value={form.time} onChange={update('time')} required />
          </div>
        </div>

        <div>
          <label htmlFor="sch-reason" className="label">Reason / notes (optional)</label>
          <input id="sch-reason" className="input" value={form.reason} onChange={update('reason')} placeholder="e.g. Lower back pain follow-up" />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'Scheduling…' : mode === 'new' ? 'Register & schedule' : 'Schedule & notify patient'}
        </button>
      </form>
    </div>
  );
};

export default ScheduleSessionForm;

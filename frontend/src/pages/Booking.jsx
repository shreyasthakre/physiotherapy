import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import Alert from '../components/Alert.jsx';
import Spinner from '../components/Spinner.jsx';
import { Section, SectionHeading } from '../components/Section.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../lib/useFetch.js';
import api from '../lib/api.js';
import { trackEvent } from '../lib/analytics.js';
import { IconCalendar, IconCheck } from '../components/icons.jsx';

const pad = (n) => String(n).padStart(2, '0');

// Build the next N selectable weekdays (skip weekends for the clinic).
const buildDays = (count = 14) => {
  const days = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (days.length < count) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) days.push(new Date(d));
  }
  return days;
};

const TIME_SLOTS = [];
for (let h = 9; h <= 16; h += 1) {
  TIME_SLOTS.push(`${pad(h)}:00`, `${pad(h)}:30`);
}

const Booking = () => {
  const { isAuthenticated, user } = useAuth();
  const { pathname } = useLocation();
  const isWorkspaceBooking = pathname.startsWith('/portal/');
  const { data: services, loading } = useFetch('/services', { select: (d) => d.services });

  const days = useMemo(() => buildDays(14), []);
  const [serviceId, setServiceId] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  const canSubmit = serviceId && selectedDay && selectedTime && status !== 'loading';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!canSubmit) return;

    const [h, m] = selectedTime.split(':').map(Number);
    const scheduled = new Date(selectedDay);
    scheduled.setHours(h, m, 0, 0);

    setStatus('loading');
    try {
      const res = await api.post('/appointments', {
        serviceId,
        scheduledAt: scheduled.toISOString(),
        reason: reason || undefined,
      });
      trackEvent('appointment_booked', { service_id: serviceId });
      setConfirmation(res.data.appointment);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Could not book the appointment.');
      setStatus('error');
    }
  };

  if (!isAuthenticated || !isWorkspaceBooking) {
    return (
      <>
        <Seo title="Book an Appointment" path="/booking" />
        <Section>
          <div className="mx-auto max-w-lg text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <IconCalendar />
            </span>
            <h1 className="mt-6 text-3xl font-extrabold text-slate-900">Book your appointment</h1>
            <p className="mt-3 text-slate-500">
              Contact the clinic and our reception team will help you choose the right treatment
              and appointment time.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/contact" className="btn-primary">
                Contact the clinic
              </Link>
              <a href="tel:+61390001234" className="btn-ghost">Call (03) 9000 1234</a>
            </div>
          </div>
        </Section>
      </>
    );
  }

  if (status === 'success' && confirmation) {
    const when = new Date(confirmation.scheduled_at).toLocaleString('en-AU', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
    return (
      <>
        <Seo title="Appointment Confirmed" path="/booking" />
        <Section>
          <div className="mx-auto max-w-lg rounded-3xl border border-teal-100 bg-teal-50 p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white">
              <IconCheck />
            </span>
            <h1 className="mt-6 text-2xl font-extrabold text-slate-900">You are booked in!</h1>
            <p className="mt-3 text-slate-600">
              Your {confirmation.service_name || 'physiotherapy'} appointment is confirmed for{' '}
              <strong>{when}</strong>. A confirmation has been sent to your email.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/portal" className="btn-primary">Back to my workspace</Link>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setConfirmation(null);
                  setStatus('idle');
                  setSelectedTime('');
                }}
              >
                Book another
              </button>
            </div>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <Seo
        title="Book an Appointment"
        description="Schedule your physiotherapy appointment online. Choose a service, pick a time, and get instant confirmation."
        path="/booking"
      />

      <div className="section-band">
        <div className="container-page py-14">
          <SectionHeading
            eyebrow="Online scheduling"
            title={`Hi ${user?.fullName?.split(' ')[0] || 'there'}, let’s find a time`}
            subtitle="Select a service, choose a day and time, and we’ll confirm instantly."
          />
        </div>
      </div>

      <Section className="pt-12">
        {loading ? (
          <Spinner />
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              {/* Service */}
              <fieldset>
                <legend className="text-lg font-bold text-slate-900">1. Choose a service</legend>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(services || []).map((s) => (
                    <label
                      key={s.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                        serviceId === s.id
                          ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-100'
                          : 'border-slate-200 hover:border-brand-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="service"
                        value={s.id}
                        checked={serviceId === s.id}
                        onChange={() => setServiceId(s.id)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block font-semibold text-slate-900">{s.name}</span>
                        <span className="block text-sm text-slate-500">
                          {s.duration_minutes} min · from ${Number(s.price).toFixed(0)}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Day */}
              <fieldset>
                <legend className="text-lg font-bold text-slate-900">2. Pick a day</legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {days.map((d) => {
                    const active = selectedDay && d.toDateString() === selectedDay.toDateString();
                    return (
                      <button
                        type="button"
                        key={d.toISOString()}
                        onClick={() => setSelectedDay(d)}
                        className={`flex w-16 flex-col items-center rounded-xl border px-2 py-3 text-sm transition ${
                          active
                            ? 'border-brand-500 bg-brand-600 text-white'
                            : 'border-slate-200 text-slate-600 hover:border-brand-300'
                        }`}
                      >
                        <span className="text-xs uppercase">
                          {d.toLocaleDateString('en-AU', { weekday: 'short' })}
                        </span>
                        <span className="text-lg font-bold">{d.getDate()}</span>
                        <span className="text-xs">
                          {d.toLocaleDateString('en-AU', { month: 'short' })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Time */}
              <fieldset>
                <legend className="text-lg font-bold text-slate-900">3. Choose a time</legend>
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {TIME_SLOTS.map((t) => (
                    <button
                      type="button"
                      key={t}
                      disabled={!selectedDay}
                      onClick={() => setSelectedTime(t)}
                      className={`rounded-lg border px-2 py-2 text-sm transition disabled:opacity-40 ${
                        selectedTime === t
                          ? 'border-brand-500 bg-brand-600 text-white'
                          : 'border-slate-200 text-slate-600 hover:border-brand-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Reason */}
              <div>
                <label htmlFor="reason" className="label">
                  Reason for visit <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  className="input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Recurring knee pain after running"
                />
              </div>
            </div>

            {/* Summary */}
            <aside className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <h3 className="text-lg font-bold text-slate-900">Booking summary</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Service</dt>
                  <dd className="font-medium text-slate-900">
                    {services?.find((s) => s.id === serviceId)?.name || '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Date</dt>
                  <dd className="font-medium text-slate-900">
                    {selectedDay
                      ? selectedDay.toLocaleDateString('en-AU', { dateStyle: 'medium' })
                      : '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Time</dt>
                  <dd className="font-medium text-slate-900">{selectedTime || '—'}</dd>
                </div>
              </dl>

              {error && (
                <div className="mt-4">
                  <Alert type="error">{error}</Alert>
                </div>
              )}

              <button type="submit" className="btn-primary mt-6 w-full" disabled={!canSubmit}>
                {status === 'loading' ? 'Booking…' : 'Confirm booking'}
              </button>
              <p className="mt-3 text-center text-xs text-slate-400">
                You’ll receive an email & SMS reminder before your visit.
              </p>
            </aside>
          </form>
        )}
      </Section>
    </>
  );
};

export default Booking;

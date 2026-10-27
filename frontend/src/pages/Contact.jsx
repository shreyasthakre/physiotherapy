import { useState } from 'react';
import Seo from '../components/Seo.jsx';
import Alert from '../components/Alert.jsx';
import { Section, SectionHeading } from '../components/Section.jsx';
import api from '../lib/api.js';
import { trackEvent } from '../lib/analytics.js';
import { IconMapPin, IconPhone, IconMail } from '../components/icons.jsx';

const initialForm = { name: '', email: '', phone: '', subject: '', message: '' };

const Contact = () => {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState('');

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setFeedback('');
    try {
      const res = await api.post('/contact', form);
      trackEvent('contact_submitted');
      setStatus('success');
      setFeedback(res.data.message || 'Thanks! We will be in touch shortly.');
      setForm(initialForm);
    } catch (err) {
      setStatus('error');
      setFeedback(err.message || 'Could not send your message. Please try again.');
    }
  };

  return (
    <>
      <Seo
        title="Contact Us"
        description="Get in touch with The Physiotherapy Clinic. Find our location, phone, email, and send us a message."
        path="/contact"
      />

      <div className="section-band">
        <div className="container-page py-16">
          <SectionHeading
            eyebrow="Contact"
            title="We’d love to hear from you"
            subtitle="Questions, referrals, or booking help — our friendly team is here for you."
          />
        </div>
      </div>

      <Section className="pt-12">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact details + map */}
          <div>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <IconMapPin />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Visit us</p>
                  <p className="text-slate-500">128 Wellness Ave, Melbourne VIC 3000</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <IconPhone />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Call us</p>
                  <a href="tel:+61390001234" className="text-slate-500 hover:text-brand-700">(03) 9000 1234</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <IconMail />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Email us</p>
                  <a href="mailto:hello@physiotherapyclinic.example" className="text-slate-500 hover:text-brand-700">
                    hello@physiotherapyclinic.example
                  </a>
                </div>
              </li>
            </ul>

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <iframe
                title="Clinic location map"
                className="h-72 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=Melbourne%20VIC%203000&output=embed"
              />
            </div>
          </div>

          {/* Form */}
          <div className="card p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">Send us a message</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="label">Full name</label>
                  <input id="name" className="input" required value={form.name} onChange={update('name')} />
                </div>
                <div>
                  <label htmlFor="email" className="label">Email</label>
                  <input id="email" type="email" className="input" required value={form.email} onChange={update('email')} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="label">Phone <span className="text-slate-400">(optional)</span></label>
                  <input id="phone" className="input" value={form.phone} onChange={update('phone')} />
                </div>
                <div>
                  <label htmlFor="subject" className="label">Subject <span className="text-slate-400">(optional)</span></label>
                  <input id="subject" className="input" value={form.subject} onChange={update('subject')} />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="label">Message</label>
                <textarea id="message" rows={5} className="input" required value={form.message} onChange={update('message')} />
              </div>

              {feedback && <Alert type={status === 'error' ? 'error' : 'success'}>{feedback}</Alert>}

              <button type="submit" className="btn-primary w-full sm:w-auto" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending…' : 'Send message'}
              </button>
            </form>
          </div>
        </div>
      </Section>
    </>
  );
};

export default Contact;

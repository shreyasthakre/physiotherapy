import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import TestimonialsCarousel from '../components/TestimonialsCarousel.jsx';
import NewsletterSignup from '../components/NewsletterSignup.jsx';
import { Section, SectionHeading } from '../components/Section.jsx';
import Spinner from '../components/Spinner.jsx';
import { useFetch } from '../lib/useFetch.js';
import { IconCalendar, IconCheck, IconHeart, IconActivity, IconArrow } from '../components/icons.jsx';

const stats = [
  { value: '4.9★', label: 'Patient rating' },
  { value: '1000+', label: 'Patients treated' },
  { value: 'MPTh', label: 'KEM Mumbai trained' },
  { value: 'Same-week', label: 'Appointments' },
];

const features = [
  {
    icon: IconActivity,
    title: 'Evidence-based care',
    text: 'Treatment plans grounded in the latest clinical research and outcome data.',
  },
  {
    icon: IconHeart,
    title: 'Patient-first approach',
    text: 'We listen, educate, and tailor every program to your goals and lifestyle.',
  },
  {
    icon: IconCalendar,
    title: 'Easy online booking',
    text: 'Reserve your slot in seconds with automatic email and SMS reminders.',
  },
];

const Home = () => {
  const { data: services, loading } = useFetch('/services', { select: (d) => d.services });
  const { data: testimonials } = useFetch('/testimonials', { select: (d) => d.testimonials });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: 'The Physiotherapy Clinic',
    description:
      'Physiotherapy clinic offering sports injury rehabilitation, post-surgery recovery, chronic pain care, and electrotherapy including TECAR, laser, and IFT.',
    medicalSpecialty: 'Physiotherapy',
    telephone: '+61-3-9000-1234',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '128 Wellness Ave',
      addressLocality: 'Melbourne',
      addressRegion: 'VIC',
      postalCode: '3000',
      addressCountry: 'AU',
    },
  };

  return (
    <>
      <Seo
        title="Move Better, Live Better"
        description="Expert physiotherapy plus TECAR, laser, IFT, ultrasound, TENS, and shockwave. Sports rehab, post-surgery recovery, and pain management. Book online."
        path="/"
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-aurora">
        {/* Decorative modern background: floating blobs + fading grid */}
        <span className="blob -left-24 -top-16 -z-10 h-72 w-72 bg-brand-300" aria-hidden="true" />
        <span
          className="blob -right-20 top-20 -z-10 h-80 w-80 bg-teal-300 [animation-delay:-5s]"
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 bg-grid" aria-hidden="true" />

        <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-in-up">
            <span className="badge">Expert physiotherapy &amp; rehabilitation</span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Move better.
              <span className="text-gradient"> Live pain-free.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              Personalised physiotherapy plus clinic modalities such as TECAR, laser, IFT,
              ultrasound, TENS, and shockwave — to recover from injury, after surgery, and chronic pain.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/booking" className="btn-primary">
                <IconCalendar /> Book Appointment
              </Link>
              <Link to="/contact" className="btn-ghost">
                Contact Us <IconArrow />
              </Link>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="glass px-4 py-3">
                  <dt className="text-xl font-extrabold text-slate-900">{s.value}</dt>
                  <dd className="text-xs text-slate-500">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative animate-fade-in-up">
            {/* Gradient glow frame behind the photo */}
            <div
              className="absolute -inset-3 -z-10 rounded-[2.25rem] bg-gradient-to-tr from-brand-400/40 via-teal-300/30 to-brand-200/40 blur-2xl"
              aria-hidden="true"
            />
            <img
              src="/images/clinic-success.png"
              alt="A recovered patient holding a medal beside physiotherapist Dr. Sheetal Kawade at The Physiotherapy Clinic"
              className="w-full rounded-[1.75rem] object-cover shadow-soft ring-1 ring-white/60"
              loading="eager"
            />
            <div className="glass absolute -bottom-6 -left-4 hidden p-4 sm:block">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                  <IconCheck />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Real patient results</p>
                  <p className="text-xs text-slate-500">Back to peak performance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <f.icon />
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{f.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Meet the physiotherapist */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-dots opacity-70" aria-hidden="true" />
        <span className="blob right-[-6rem] top-10 -z-10 h-72 w-72 bg-brand-200" aria-hidden="true" />
        <div className="container-page grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2">
          <div className="relative order-last lg:order-first">
            <div
              className="absolute -inset-4 -z-10 rounded-[2.25rem] bg-gradient-to-tr from-brand-300/40 to-teal-300/40 blur-2xl"
              aria-hidden="true"
            />
            <img
              src="/images/dr-sheetal.png"
              alt="Dr. Sheetal Kawade Ranpaonkar, lead physiotherapist at The Physiotherapy Clinic"
              className="w-full rounded-[1.75rem] object-cover shadow-soft ring-1 ring-white/60"
              loading="lazy"
            />
            <div className="glass absolute -bottom-5 -right-4 hidden p-4 text-center sm:block">
              <p className="text-lg font-extrabold text-brand-700">MPTh</p>
              <p className="text-xs text-slate-500">KEM Hospital, Mumbai</p>
            </div>
          </div>

          <div>
            <span className="badge">Meet your physiotherapist</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Dr. Sheetal Kawade Ranpaonkar
            </h2>
            <p className="mt-2 font-semibold text-brand-700">Lead Physiotherapist &amp; Founder</p>
            <p className="mt-4 text-slate-600">
              Dr. Sheetal blends advanced manual therapy with evidence-based rehabilitation to help
              patients recover fully and return to the activities they love — from everyday movement
              to competitive sport. Every plan is personalised, hands-on, and built around your goals.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                'Master of Physiotherapy (MPTh) — KEM Hospital, Mumbai',
                'Advanced Diploma in Manual Therapy & Chiropractic (Sweden)',
                'Certified in CCT, CKT & Dry Needling (CDNT)',
                'Special interest in sports injury & post-surgery rehab',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-700">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/booking" className="btn-primary">
                <IconCalendar /> Book with Dr. Sheetal
              </Link>
              <Link to="/services" className="btn-ghost">
                Explore services <IconArrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <Section className="pt-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="What we treat"
            title="Physiotherapy services"
            subtitle="Hands-on rehab plus TECAR, laser, IFT, ultrasound, TENS, and shockwave."
          />
          <Link to="/services" className="hidden items-center gap-1 text-sm font-semibold text-brand-700 hover:gap-2 sm:inline-flex">
            View all services <IconArrow />
          </Link>
        </div>

        <div className="mt-10">
          {loading ? (
            <Spinner />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(services || []).slice(0, 6).map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Testimonials */}
      <section className="relative isolate overflow-hidden bg-aurora">
        <span className="blob -left-16 bottom-0 -z-10 h-72 w-72 bg-teal-200" aria-hidden="true" />
        <div className="container-page py-16 sm:py-20">
          <SectionHeading
            center
            eyebrow="Success stories"
            title="Loved by our patients"
            subtitle="Real results from real people we have helped get back to doing what they love."
          />
          <div className="mt-12">
            <TestimonialsCarousel testimonials={testimonials || []} />
          </div>
        </div>
      </section>

      {/* CTA + newsletter */}
      <Section>
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-teal-600 px-6 py-14 text-center text-white sm:px-12">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to start your recovery?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-brand-50">
            Book your initial assessment today, or subscribe for monthly recovery tips from our team.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/booking" className="btn bg-white text-brand-700 hover:bg-brand-50">
              <IconCalendar /> Book your appointment
            </Link>
          </div>
          <div className="mx-auto mt-8 max-w-md [&_input]:bg-white">
            <NewsletterSignup />
          </div>
        </div>
      </Section>
    </>
  );
};

export default Home;

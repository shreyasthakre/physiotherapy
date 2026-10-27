import { useParams, Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import { useFetch } from '../lib/useFetch.js';
import { IconCalendar, IconCheck, IconArrow } from '../components/icons.jsx';

const ServiceDetail = () => {
  const { slug } = useParams();
  const { data: service, loading, error } = useFetch(`/services/${slug}`, {
    select: (d) => d.service,
  });

  if (loading) {
    return (
      <div className="container-page py-24">
        <Spinner />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container-page py-24">
        <Alert type="error">{error?.message || 'Service not found.'}</Alert>
        <Link to="/services" className="mt-4 inline-flex items-center gap-1 text-brand-700">
          <IconArrow className="rotate-180" /> Back to services
        </Link>
      </div>
    );
  }

  const paragraphs = (service.description || '').split('\n').filter(Boolean);

  return (
    <>
      <Seo
        title={service.name}
        description={service.short_description}
        path={`/services/${service.slug}`}
        type="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'MedicalTherapy',
          name: service.name,
          description: service.short_description,
        }}
      />

      <div className="section-band">
        <div className="container-page grid items-center gap-10 py-14 lg:grid-cols-2">
          <div>
            <Link to="/services" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
              <IconArrow className="rotate-180" /> All services
            </Link>
            {service.category && <span className="badge">{service.category}</span>}
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">{service.name}</h1>
            <p className="mt-4 text-lg text-slate-600">{service.short_description}</p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">⏱ {service.duration_minutes} min sessions</span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">💳 from ${Number(service.price).toFixed(0)}</span>
            </div>
            <Link to="/booking" className="btn-primary mt-8">
              <IconCalendar /> Book this service
            </Link>
          </div>
          {service.image_url && (
            <img
              src={service.image_url}
              alt={service.name}
              className="w-full rounded-3xl object-cover shadow-soft"
              loading="eager"
            />
          )}
        </div>
      </div>

      <div className="container-page grid gap-12 py-16 lg:grid-cols-3">
        <article className="prose-slate lg:col-span-2">
          <h2 className="text-2xl font-bold text-slate-900">About this program</h2>
          <div className="mt-4 space-y-4 text-slate-600">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>

        <aside className="h-fit rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <h3 className="text-lg font-bold text-slate-900">What to expect</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {[
              'Comprehensive initial assessment',
              'Personalised treatment plan',
              'Hands-on therapy & guided exercise',
              'Home exercise program & progress tracking',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-teal-600">
                  <IconCheck />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
};

export default ServiceDetail;

import Seo from '../components/Seo.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import { Section, SectionHeading } from '../components/Section.jsx';
import { useFetch } from '../lib/useFetch.js';

const Services = () => {
  const { data: services, loading, error } = useFetch('/services', {
    select: (d) => d.services,
  });

  return (
    <>
      <Seo
        title="Physiotherapy Services"
        description="Explore physiotherapy and electrotherapy: TECAR, laser, IFT, ultrasound, TENS, shockwave, sports rehab, post-surgery recovery, and pain management."
        path="/services"
      />

      <div className="section-band">
        <div className="container-page py-16">
          <SectionHeading
            eyebrow="Our services"
            title="Care tailored to your recovery"
            subtitle="Hands-on rehab plus clinic modalities including TECAR, laser, IFT, ultrasound, TENS, and shockwave — each plan starts with an assessment around your goals."
          />
        </div>
      </div>

      <Section className="pt-12">
        {error && <Alert type="error">{error.message}</Alert>}
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(services || []).map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
};

export default Services;

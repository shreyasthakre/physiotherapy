import Seo from '../components/Seo.jsx';
import Spinner from '../components/Spinner.jsx';
import TestimonialsCarousel from '../components/TestimonialsCarousel.jsx';
import { Section, SectionHeading } from '../components/Section.jsx';
import { useFetch } from '../lib/useFetch.js';
import { IconStar } from '../components/icons.jsx';

const Testimonials = () => {
  const { data: testimonials, loading } = useFetch('/testimonials', {
    select: (d) => d.testimonials,
  });

  return (
    <>
      <Seo
        title="Patient Testimonials"
        description="Read success stories from patients who recovered with The Physiotherapy Clinic."
        path="/testimonials"
      />

      <div className="section-band">
        <div className="container-page py-16">
          <SectionHeading
            center
            eyebrow="Success stories"
            title="What our patients say"
            subtitle="We are proud of the results we help our patients achieve every day."
          />
        </div>
      </div>

      <Section>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <TestimonialsCarousel testimonials={testimonials || []} />

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(testimonials || []).map((t) => (
                <figure key={t.id} className="card p-6">
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <IconStar key={i} filled={i < t.rating} />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-slate-600">“{t.quote}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    {t.avatar_url && (
                      <img src={t.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" loading="lazy" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">{t.patient_name}</p>
                      {t.location && <p className="text-sm text-slate-500">{t.location}</p>}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </>
        )}
      </Section>
    </>
  );
};

export default Testimonials;

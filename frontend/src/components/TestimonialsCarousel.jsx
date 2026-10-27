import { useEffect, useRef, useState } from 'react';
import { IconStar, IconChevronLeft, IconChevronRight } from './icons.jsx';

const Stars = ({ rating = 5 }) => (
  <div className="flex gap-0.5 text-amber-400" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <IconStar key={i} filled={i < rating} />
    ))}
  </div>
);

const TestimonialsCarousel = ({ testimonials = [] }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  const count = testimonials.length;

  const go = (next) => setIndex(((next % count) + count) % count);

  useEffect(() => {
    if (paused || count <= 1) return undefined;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(timer.current);
  }, [paused, count]);

  if (count === 0) {
    return <p className="text-center text-slate-500">No testimonials yet.</p>;
  }

  const active = testimonials[index];

  return (
    <div
      className="relative mx-auto max-w-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Patient testimonials"
    >
      <div className="card p-8 sm:p-10 text-center animate-fade-in-up" key={active.id}>
        <div className="mx-auto mb-4 flex justify-center">
          <Stars rating={active.rating} />
        </div>
        <blockquote className="text-lg leading-relaxed text-slate-700 sm:text-xl">
          “{active.quote}”
        </blockquote>
        <figcaption className="mt-6 flex items-center justify-center gap-3">
          {active.avatar_url && (
            <img
              src={active.avatar_url}
              alt=""
              className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-100"
              loading="lazy"
            />
          )}
          <div className="text-left">
            <p className="font-semibold text-slate-900">{active.patient_name}</p>
            {active.location && <p className="text-sm text-slate-500">{active.location}</p>}
          </div>
        </figcaption>
      </div>

      {count > 1 && (
        <>
          <div className="mt-6 flex items-center justify-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={i === index}
                className={`h-2.5 rounded-full transition-all ${
                  i === index ? 'w-6 bg-brand-600' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous testimonial"
            className="absolute left-0 top-1/2 hidden -translate-y-1/2 -translate-x-4 rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:text-brand-700 lg:block"
          >
            <IconChevronLeft />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next testimonial"
            className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-4 rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:text-brand-700 lg:block"
          >
            <IconChevronRight />
          </button>
        </>
      )}
    </div>
  );
};

export default TestimonialsCarousel;

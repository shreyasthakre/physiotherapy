export const SectionHeading = ({ eyebrow, title, subtitle, center = false }) => (
  <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
    {eyebrow && <p className="badge mb-3">{eyebrow}</p>}
    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
    {subtitle && <p className="mt-4 text-lg text-slate-500">{subtitle}</p>}
  </div>
);

export const Section = ({ children, className = '' }) => (
  <section className={`container-page py-16 sm:py-20 ${className}`}>{children}</section>
);

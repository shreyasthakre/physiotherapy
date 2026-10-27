import { Link } from 'react-router-dom';
import { IconArrow } from './icons.jsx';

const ServiceCard = ({ service }) => (
  <article className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-soft">
    {service.image_url && (
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={service.image_url}
          alt={service.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
    )}
    <div className="p-6">
      {service.category && <span className="badge mb-3">{service.category}</span>}
      <h3 className="text-lg font-bold text-slate-900">{service.name}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-slate-500">{service.short_description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">
          {service.duration_minutes} min · from ${Number(service.price).toFixed(0)}
        </span>
        <Link
          to={`/services/${service.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:gap-2"
        >
          Learn more <IconArrow />
        </Link>
      </div>
    </div>
  </article>
);

export default ServiceCard;

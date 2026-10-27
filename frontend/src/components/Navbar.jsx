import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { IconMenu, IconClose, IconActivity } from './icons.jsx';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/blog', label: 'Resources' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = ({ isActive }) =>
    `rounded-full px-3 py-2 text-sm font-medium transition ${
      isActive ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:text-brand-700'
    }`;

  return (
    <header
      className={`sticky top-0 z-40 border-b transition ${
        scrolled ? 'border-slate-200 bg-white/90 backdrop-blur' : 'border-transparent bg-white/70 backdrop-blur'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Primary">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-teal-600 text-white">
            <IconActivity />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            The Physiotherapy<span className="text-brand-600"> Clinic</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/booking" className="btn-primary">
            Book Appointment
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <IconClose /> : <IconMenu />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="border-t border-slate-100 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/booking" className="btn-primary" onClick={() => setOpen(false)}>
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

import { Link } from 'react-router-dom';
import NewsletterSignup from './NewsletterSignup.jsx';
import { IconActivity, IconMapPin, IconPhone, IconMail } from './icons.jsx';

const Footer = () => (
  <footer className="mt-20 border-t border-slate-200 bg-white">
    <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
      <div>
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-teal-600 text-white">
            <IconActivity />
          </span>
          <span className="text-lg font-extrabold text-slate-900">
            The Physiotherapy<span className="text-brand-600"> Clinic</span>
          </span>
        </Link>
        <p className="mt-4 max-w-xs text-sm text-slate-500">
          Evidence-based physiotherapy that helps you move better and live pain-free.
        </p>
      </div>

      <nav aria-label="Footer">
        <h3 className="text-sm font-semibold text-slate-900">Explore</h3>
        <ul className="mt-4 space-y-2 text-sm text-slate-500">
          <li><Link to="/services" className="hover:text-brand-700">Services</Link></li>
          <li><Link to="/booking" className="hover:text-brand-700">Book Appointment</Link></li>
          <li><Link to="/blog" className="hover:text-brand-700">Resources & Blog</Link></li>
          <li><Link to="/testimonials" className="hover:text-brand-700">Testimonials</Link></li>
        </ul>
      </nav>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Get in touch</h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-500">
          <li className="flex items-start gap-2">
            <IconMapPin className="mt-0.5 shrink-0 text-brand-600" />
            <span>128 Wellness Ave, Melbourne VIC 3000</span>
          </li>
          <li className="flex items-center gap-2">
            <IconPhone className="shrink-0 text-brand-600" />
            <a href="tel:+61390001234" className="hover:text-brand-700">(03) 9000 1234</a>
          </li>
          <li className="flex items-center gap-2">
            <IconMail className="shrink-0 text-brand-600" />
            <a href="mailto:hello@physiotherapyclinic.example" className="hover:text-brand-700">hello@physiotherapyclinic.example</a>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Newsletter</h3>
        <p className="mt-4 text-sm text-slate-500">Recovery tips and clinic news, monthly.</p>
        <div className="mt-4">
          <NewsletterSignup compact />
        </div>
      </div>
    </div>

    <div className="border-t border-slate-100">
      <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-slate-400 sm:flex-row">
        <p>© {new Date().getFullYear()} The Physiotherapy Clinic. All rights reserved.</p>
        <p>Registered physiotherapists · AHPRA compliant</p>
      </div>
    </div>
  </footer>
);

export default Footer;

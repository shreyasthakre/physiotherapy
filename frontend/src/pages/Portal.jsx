import { Link, Outlet, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { IconActivity } from '../components/icons.jsx';

const roleLabels = {
  patient: 'Patient Portal',
  physiotherapist: 'Physiotherapist Dashboard',
  admin: 'Admin Dashboard',
};

// Patient & physiotherapist portal shell. Admins use the dedicated /admin panel.
const Portal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Seo title={roleLabels[user.role]} path="/portal" />

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/portal" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-teal-600 text-white">
              <IconActivity />
            </span>
            <span className="font-extrabold tracking-tight text-slate-900">Clinic Workspace</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              {user.role === 'patient' ? 'Patient' : 'Physiotherapist'}
            </span>
          </Link>
          <button type="button" onClick={handleLogout} className="btn-ghost">Log out</button>
        </div>
      </header>

      <div className="section-band">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-10">
          <div>
            <p className="badge">{roleLabels[user.role]}</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome, {user.fullName?.split(' ')[0]}
            </h1>
            <p className="mt-1 text-slate-500">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="container-page py-12">
        <Outlet />
      </div>
    </div>
  );
};

export default Portal;

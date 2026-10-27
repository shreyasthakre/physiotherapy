import { Outlet, Link, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { AdminDataProvider } from '../context/AdminDataContext.jsx';
import AdminSidebar from '../components/portal/AdminSidebar.jsx';
import { IconActivity } from '../components/icons.jsx';

/**
 * The whole app is now a single admin panel. This shell provides the top bar
 * (brand + logout) and the sidebar; the sub-pages render in the Outlet.
 */
const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AdminDataProvider>
      <Seo title="Admin Dashboard" path="/admin" />
      <div className="flex min-h-screen flex-col bg-slate-50">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
          <div className="container-page flex h-16 items-center justify-between gap-4">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-teal-600 text-white">
                <IconActivity />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                The Physiotherapy<span className="text-brand-600"> Clinic</span>
              </span>
              <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                Admin
              </span>
            </Link>
            <div className="flex items-center gap-3">
              {user?.fullName && (
                <span className="hidden text-sm text-slate-500 sm:inline">{user.fullName}</span>
              )}
              <button type="button" onClick={handleLogout} className="btn-ghost">
                Log out
              </button>
            </div>
          </div>
        </header>

        <div className="container-page grid flex-1 gap-8 py-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <AdminSidebar />
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </AdminDataProvider>
  );
};

export default AdminPanel;

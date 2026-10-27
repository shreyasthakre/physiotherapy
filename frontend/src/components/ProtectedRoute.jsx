import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

/**
 * Guards routes that require authentication (and optionally a role).
 * Redirects unauthenticated users to /login, preserving the intended path.
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Signed in but not permitted here (e.g. a non-admin hitting /admin).
  // Send them to their own portal.
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/portal" replace />;
  }

  return children;
};

export default ProtectedRoute;

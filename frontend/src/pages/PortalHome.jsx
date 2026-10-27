import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PhysioDashboard from './portal/PhysioDashboard.jsx';
import PatientDashboard from './portal/PatientDashboard.jsx';

/** Index page under /portal — the right home view for the user's role. */
const PortalHome = () => {
  const { user } = useAuth();
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'physiotherapist') return <PhysioDashboard />;
  return <PatientDashboard />;
};

export default PortalHome;

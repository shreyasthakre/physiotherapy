import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import Alert from '../components/Alert.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { IconActivity } from '../components/icons.jsx';

const quickAccounts = [
  { role: 'admin', label: 'Front desk', description: 'Appointments, arrivals and patients', email: 'admin@physioclinic.example', password: 'Admin@12345' },
  { role: 'physiotherapist', label: 'Physiotherapist', description: 'Today’s sessions and clinical notes', email: 'physio@physioclinic.example', password: 'Physio@12345' },
  { role: 'patient', label: 'Patient', description: 'Visits, bookings and care plan', email: 'patient@physioclinic.example', password: 'Patient@12345' },
];

// Admins land in the admin panel; patients and physios use their portal.
const homeFor = (role) => (role === 'admin' ? '/admin' : '/portal');

const Login = () => {
  const { login, logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Send an already-signed-in visitor to their home.
  useEffect(() => {
    if (isAuthenticated) navigate(homeFor(user?.role), { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (mail, pass) => {
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(mail, pass);
      if (selectedRole && loggedInUser.role !== selectedRole) {
        logout();
        setError(`This account is not a ${account?.label || selectedRole} account.`);
        return;
      }
      navigate(homeFor(loggedInUser.role), { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn(email, password);
  };

  const account = quickAccounts.find((item) => item.role === selectedRole);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <Seo title="Login" path="/login" />
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl place-items-center">
        <div className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-teal-600 text-white">
              <IconActivity />
            </span>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-teal-400">Clinic handling app</p>
            <h1 className="mt-2 text-2xl font-extrabold text-white">Welcome back</h1>
            <p className="text-sm text-slate-400">Secure access for administrators, physiotherapists and patients.</p>
          </div>

          {!account ? (
            <div className="card space-y-3 p-5 sm:p-6">
              <p className="text-center text-sm font-semibold text-slate-700">Choose your workspace</p>
              {quickAccounts.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setSelectedRole(item.role)}
                  className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-brand-300 hover:bg-brand-50"
                >
                  <span className="font-bold text-slate-900">{item.label}</span>
                  <span className="mt-1 block text-sm text-slate-500">{item.description}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="card p-6 sm:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Sign in as</p>
                  <h2 className="font-bold text-slate-900">{account.label}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole(null);
                    setError('');
                  }}
                  className="text-sm font-semibold text-slate-500 hover:text-brand-700"
                >
                  Change
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="label">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <Alert type="error">{error}</Alert>}

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              </form>

              {selectedRole === 'patient' && (
                <p className="mt-5 text-center text-sm text-slate-500">
                  New patient?{' '}
                  <Link to="/register" className="font-semibold text-brand-700">
                    Create an account
                  </Link>
                </p>
              )}

              {import.meta.env.DEV && (
                <button
                  type="button"
                  onClick={() => signIn(account.email, account.password)}
                  disabled={loading}
                  className="mt-5 w-full border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400 hover:text-brand-700 disabled:opacity-60"
                >
                  Demo: sign in as {account.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

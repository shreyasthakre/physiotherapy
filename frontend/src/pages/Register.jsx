import { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import Alert from '../components/Alert.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { IconActivity } from '../components/icons.jsx';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/portal';

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to={from} replace />;

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <Seo title="Create Account" path="/register" />
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl place-items-center">
        <div className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-teal-600 text-white">
              <IconActivity />
            </span>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-teal-400">Patient workspace</p>
            <h1 className="mt-2 text-2xl font-extrabold text-white">Create your account</h1>
            <p className="text-sm text-slate-400">Manage appointments and track your recovery securely.</p>
          </div>

          <div className="card p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="fullName" className="label">Full name</label>
                <input id="fullName" className="input" required value={form.fullName} onChange={update('fullName')} />
              </div>
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input id="email" type="email" autoComplete="email" className="input" required value={form.email} onChange={update('email')} />
              </div>
              <div>
                <label htmlFor="phone" className="label">Phone <span className="text-slate-400">(optional)</span></label>
                <input id="phone" className="input" value={form.phone} onChange={update('phone')} />
              </div>
              <div>
                <label htmlFor="password" className="label">Password</label>
                <input id="password" type="password" autoComplete="new-password" className="input" required minLength={8} value={form.password} onChange={update('password')} />
                <p className="mt-1 text-xs text-slate-400">At least 8 characters.</p>
              </div>

              {error && <Alert type="error">{error}</Alert>}

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" state={{ from }} className="font-semibold text-brand-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

import { useState } from 'react';
import Spinner from '../../../components/Spinner.jsx';
import api from '../../../lib/api.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useAdminData } from '../../../context/AdminDataContext.jsx';

const ROLES = ['admin', 'physiotherapist', 'patient'];
const roleTone = {
  admin: 'bg-violet-50 text-violet-700',
  physiotherapist: 'bg-brand-50 text-brand-700',
  patient: 'bg-teal-50 text-teal-700',
};

const Users = () => {
  const { user: me } = useAuth();
  const { users, usersLoading, refreshUsers, showToast } = useAdminData();

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [savingId, setSavingId] = useState(null);

  const q = query.trim().toLowerCase();
  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (q) return `${u.full_name} ${u.email}`.toLowerCase().includes(q);
    return true;
  });

  const changeRole = async (u, role) => {
    if (role === u.role) return;
    setSavingId(u.id);
    try {
      await api.patch(`/admin/users/${u.id}/role`, { role });
      showToast(`${u.full_name} is now ${role}.`);
      refreshUsers();
    } catch (err) {
      showToast(err.message || 'Could not update role.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Staff &amp; users</h1>
      <p className="mt-1 text-sm text-slate-500">Manage accounts and roles for your clinic.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          className="input max-w-xs"
          placeholder="Search name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="input w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
        <span className="ml-auto text-sm text-slate-400">{filtered.length} user{filtered.length === 1 ? '' : 's'}</span>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Change role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {usersLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6">
                  <Spinner />
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{u.full_name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${roleTone[u.role] || 'bg-slate-100 text-slate-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(u.created_at).toLocaleDateString('en-AU')}
                  </td>
                  <td className="px-4 py-3">
                    {u.id === me.id ? (
                      <span className="text-xs text-slate-400">You</span>
                    ) : (
                      <select
                        className="input w-auto py-1 text-sm"
                        value={u.role}
                        disabled={savingId === u.id}
                        onChange={(e) => changeRole(u, e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;

import { useState } from 'react';
import Spinner from '../../../components/Spinner.jsx';
import { useAdminData } from '../../../context/AdminDataContext.jsx';

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' });

const Messages = () => {
  const { messages, messagesLoading } = useAdminData();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = messages.filter((m) =>
    q ? `${m.name} ${m.email || ''} ${m.subject || ''} ${m.message}`.toLowerCase().includes(q) : true,
  );

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Contact messages</h1>
      <p className="mt-1 text-sm text-slate-500">Enquiries submitted through the website contact form.</p>

      <div className="mt-6 flex items-center gap-2">
        <input
          className="input max-w-xs"
          placeholder="Search messages…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="ml-auto text-sm text-slate-400">{filtered.length} message{filtered.length === 1 ? '' : 's'}</span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {messagesLoading ? (
          <Spinner />
        ) : filtered.length > 0 ? (
          filtered.map((m) => (
            <div key={m.id} className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-slate-800">{m.name}</p>
                <span className="shrink-0 text-xs text-slate-400">{formatDateTime(m.created_at)}</span>
              </div>
              {m.email && <p className="text-xs text-slate-400">{m.email}</p>}
              <p className="mt-1 text-sm font-medium text-slate-600">{m.subject || '(no subject)'}</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{m.message}</p>
            </div>
          ))
        ) : (
          <div className="card p-8 text-center text-slate-500 md:col-span-2">No messages found.</div>
        )}
      </div>
    </div>
  );
};

export default Messages;
